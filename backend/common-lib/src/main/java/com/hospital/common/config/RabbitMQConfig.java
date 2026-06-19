package com.hospital.common.config;

import com.hospital.common.security.SecurityConstants;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ configuration shared across services.
 * Declares the topic exchange and all queues with routing keys.
 */
@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange hospitalExchange() {
        return new TopicExchange(SecurityConstants.EXCHANGE_HOSPITAL);
    }

    // --- Queues ---

    @Bean
    public Queue appointmentQueue() {
        return QueueBuilder.durable(SecurityConstants.QUEUE_APPOINTMENT).build();
    }

    @Bean
    public Queue billingQueue() {
        return QueueBuilder.durable(SecurityConstants.QUEUE_BILLING).build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(SecurityConstants.QUEUE_NOTIFICATION).build();
    }

    @Bean
    public Queue auditQueue() {
        return QueueBuilder.durable(SecurityConstants.QUEUE_AUDIT).build();
    }

    // --- Bindings ---

    @Bean
    public Binding appointmentBinding(Queue appointmentQueue, TopicExchange hospitalExchange) {
        return BindingBuilder.bind(appointmentQueue)
                .to(hospitalExchange)
                .with(SecurityConstants.ROUTING_KEY_APPOINTMENT);
    }

    @Bean
    public Binding billingBinding(Queue billingQueue, TopicExchange hospitalExchange) {
        return BindingBuilder.bind(billingQueue)
                .to(hospitalExchange)
                .with(SecurityConstants.ROUTING_KEY_BILLING);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange hospitalExchange) {
        return BindingBuilder.bind(notificationQueue)
                .to(hospitalExchange)
                .with(SecurityConstants.ROUTING_KEY_NOTIFICATION);
    }

    @Bean
    public Binding auditBinding(Queue auditQueue, TopicExchange hospitalExchange) {
        return BindingBuilder.bind(auditQueue)
                .to(hospitalExchange)
                .with(SecurityConstants.ROUTING_KEY_AUDIT);
    }

    // --- Message Converter ---

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
