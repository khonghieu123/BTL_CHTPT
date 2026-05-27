package com.ptit.ecommerce.productservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String PRODUCT_QUEUE = "product.order-created.queue";
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";

    // Declare the Topic Exchange
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    // Declare the Queue for Product Service
    @Bean
    public Queue productQueue() {
        return QueueBuilder.durable(PRODUCT_QUEUE).build();
    }

    // Bind Product Queue to Exchange using Routing Key
    @Bean
    public Binding bindingProductQueue(Queue productQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(productQueue).to(orderExchange).with(ORDER_CREATED_ROUTING_KEY);
    }

    // Configure Jackson JSON Message Converter for deserialization
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
