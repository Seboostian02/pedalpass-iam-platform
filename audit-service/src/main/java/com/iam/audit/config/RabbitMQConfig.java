package com.iam.audit.config;

import com.iam.common.config.RabbitMQConstants;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange iamEventsExchange() {
        return new TopicExchange(RabbitMQConstants.EVENTS_EXCHANGE);
    }

    @Bean
    public TopicExchange deadLetterExchange() {
        return new TopicExchange(RabbitMQConstants.DEAD_LETTER_EXCHANGE);
    }

    // Auth events queue
    @Bean
    public Queue auditAuthQueue() {
        return QueueBuilder.durable("audit.auth.queue")
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DEAD_LETTER_EXCHANGE)
                .build();
    }

    @Bean
    public Binding auditAuthBinding() {
        return BindingBuilder.bind(auditAuthQueue())
                .to(iamEventsExchange())
                .with("auth.#");
    }

    // User events queue
    @Bean
    public Queue auditUserQueue() {
        return QueueBuilder.durable("audit.user.queue")
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DEAD_LETTER_EXCHANGE)
                .build();
    }

    @Bean
    public Binding auditUserBinding() {
        return BindingBuilder.bind(auditUserQueue())
                .to(iamEventsExchange())
                .with("user.*");
    }

    // Resource events queue
    @Bean
    public Queue auditResourceQueue() {
        return QueueBuilder.durable("audit.resource.queue")
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DEAD_LETTER_EXCHANGE)
                .build();
    }

    @Bean
    public Binding auditResourceBinding() {
        return BindingBuilder.bind(auditResourceQueue())
                .to(iamEventsExchange())
                .with("resource.#");
    }

    // Security events queue
    @Bean
    public Queue auditSecurityQueue() {
        return QueueBuilder.durable("audit.security.queue")
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DEAD_LETTER_EXCHANGE)
                .build();
    }

    @Bean
    public Binding auditSecurityBinding() {
        return BindingBuilder.bind(auditSecurityQueue())
                .to(iamEventsExchange())
                .with("security.#");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
