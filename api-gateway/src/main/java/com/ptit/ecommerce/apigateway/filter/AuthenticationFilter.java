package com.ptit.ecommerce.apigateway.filter;

import com.ptit.ecommerce.apigateway.dto.UserValidationResponse;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final WebClient.Builder webClientBuilder;
    private final ReactiveStringRedisTemplate redisTemplate;

    public AuthenticationFilter(WebClient.Builder webClientBuilder, ReactiveStringRedisTemplate redisTemplate) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
        this.redisTemplate = redisTemplate;
    }

    public static class Config {
        // Configuration properties can go here
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // 1. Intercept Logout API directly at the API Gateway
            if (path.endsWith("/api/v1/auth/logout")) {
                if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
                }

                String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    return onError(exchange, "Invalid Authorization Header Format", HttpStatus.UNAUTHORIZED);
                }

                String token = authHeader.substring(7);

                // Add token to Redis Blacklist with 24 hours TTL (standard token expiration time)
                return redisTemplate.opsForValue().set("blacklist:" + token, "true", Duration.ofSeconds(86400))
                        .flatMap(success -> {
                            ServerHttpResponse response = exchange.getResponse();
                            response.setStatusCode(HttpStatus.OK);
                            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                            String body = "{\"message\": \"Logout successful. Token successfully blacklisted.\"}";
                            return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
                        })
                        .onErrorResume(err -> onError(exchange, "Logout processing error", HttpStatus.INTERNAL_SERVER_ERROR));
            }

            // 2. Standard authentication flow for secured endpoints
            if (isSecured(request)) {
                if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
                }

                String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    return onError(exchange, "Invalid Authorization Header Format", HttpStatus.UNAUTHORIZED);
                }

                String token = authHeader.substring(7);

                // 2b. Check if the token has been blacklisted in Redis
                return redisTemplate.hasKey("blacklist:" + token)
                        .flatMap(isBlacklisted -> {
                            if (Boolean.TRUE.equals(isBlacklisted)) {
                                return onError(exchange, "Token is revoked (user is logged out)", HttpStatus.UNAUTHORIZED);
                            }

                            // 3. Make REST call to User Service to validate JWT
                            String userServiceHost = System.getenv("USER_SERVICE_URL") != null 
                                    ? System.getenv("USER_SERVICE_URL") 
                                    : "http://localhost:8081";

                            return webClientBuilder.build()
                                    .get()
                                    .uri(userServiceHost + "/api/v1/auth/validate?token=" + token)
                                    .retrieve()
                                    .bodyToMono(UserValidationResponse.class)
                                    .flatMap(response -> {
                                        if (response != null && response.isValid()) {
                                            // 4. Token valid! Append user info to headers and forward downstream
                                            ServerHttpRequest mutatedRequest = request.mutate()
                                                    .header("X-User-Id", String.valueOf(response.getUserId()))
                                                    .header("X-User-Username", response.getUsername())
                                                    .header("X-User-Role", response.getRole())
                                                    .build();
                                            return chain.filter(exchange.mutate().request(mutatedRequest).build());
                                        } else {
                                            return onError(exchange, "Invalid Token", HttpStatus.UNAUTHORIZED);
                                        }
                                    });
                        })
                        .onErrorResume(err -> {
                            HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
                            String message = "Identity Service Authentication Error";
                            if (err instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                                org.springframework.web.reactive.function.client.WebClientResponseException webEx = 
                                        (org.springframework.web.reactive.function.client.WebClientResponseException) err;
                                if (webEx.getStatusCode().value() == 401) {
                                    status = HttpStatus.UNAUTHORIZED;
                                    message = "Unauthorized - Invalid Token";
                                } else if (webEx.getStatusCode().value() == 403) {
                                    status = HttpStatus.FORBIDDEN;
                                    message = "Forbidden - Access Denied";
                                }
                            }
                            return onError(exchange, message, status);
                        });
            }

            return chain.filter(exchange);
        };
    }

    private boolean isSecured(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        List<String> openEndpoints = List.of(
                "/api/v1/auth/register",
                "/api/v1/auth/login",
                "/api/v1/auth/validate"
        );
        
        if (path.startsWith("/api/v1/products") && request.getMethod().name().equalsIgnoreCase("GET")) {
            return false;
        }

        return openEndpoints.stream().noneMatch(path::contains);
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add("X-Auth-Error", err);
        return response.setComplete();
    }
}
