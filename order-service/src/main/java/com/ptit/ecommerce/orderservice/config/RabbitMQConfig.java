package com.ptit.ecommerce.orderservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Name of the Exchange
    public static final String ORDER_EXCHANGE = "order.exchange";

    // Names of the Queues
    public static final String PRODUCT_QUEUE = "product.order-created.queue";
    public static final String NOTIFICATION_QUEUE = "notification.order-created.queue";
    public static final String ORDER_FAILED_QUEUE = "order.failed.queue";

    // Routing Keys
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String ORDER_FAILED_ROUTING_KEY = "order.failed";

    // 1. Declare the Topic Exchange
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    // 2. Declare the Queue for Product Service
    @Bean
    public Queue productQueue() {
        return QueueBuilder.durable(PRODUCT_QUEUE).build();
    }

    // 3. Declare the Queue for Notification Service
    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    // 3b. Declare the Queue for Order Rollback (Saga)
    @Bean
    public Queue orderFailedQueue() {
        return QueueBuilder.durable(ORDER_FAILED_QUEUE).build();
    }

    // 4. Bind Product Queue to Exchange using Routing Key
    @Bean
    public Binding bindingProductQueue(Queue productQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(productQueue).to(orderExchange).with(ORDER_CREATED_ROUTING_KEY);
    }

    // 5. Bind Notification Queue to Exchange using Routing Key
    @Bean
    public Binding bindingNotificationQueue(Queue notificationQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(notificationQueue).to(orderExchange).with(ORDER_CREATED_ROUTING_KEY);
    }

    // 5b. Bind Order Failed Queue to Exchange using Routing Key
    @Bean
    public Binding bindingOrderFailedQueue(Queue orderFailedQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderFailedQueue).to(orderExchange).with(ORDER_FAILED_ROUTING_KEY);
    }

    // 6. Configure Jackson JSON Message Converter for serialization
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
