package com.ptit.ecommerce.notificationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String NOTIFICATION_QUEUE = "notification.order-created.queue";
    public static final String NOTIFICATION_FAILED_QUEUE = "notification.order-failed.queue";
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String ORDER_FAILED_ROUTING_KEY = "order.failed";

    // Declare the Topic Exchange
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    // Declare the Queue for Notification Service (Created Event)
    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    // Bind Notification Queue to Exchange using Routing Key
    @Bean
    public Binding bindingNotificationQueue(Queue notificationQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(notificationQueue).to(orderExchange).with(ORDER_CREATED_ROUTING_KEY);
    }

    // Declare the Queue for Notification Service (Failed Event)
    @Bean
    public Queue notificationFailedQueue() {
        return QueueBuilder.durable(NOTIFICATION_FAILED_QUEUE).build();
    }

    // Bind Notification Failed Queue to Exchange using Routing Key
    @Bean
    public Binding bindingNotificationFailedQueue(Queue notificationFailedQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(notificationFailedQueue).to(orderExchange).with(ORDER_FAILED_ROUTING_KEY);
    }

    // Configure Jackson JSON Message Converter for deserialization
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
