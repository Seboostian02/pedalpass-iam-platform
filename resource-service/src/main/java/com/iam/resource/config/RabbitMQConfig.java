package com.iam.resource.config;

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
    public Queue collisionCheckQueue() {
        return QueueBuilder.durable(RabbitMQConstants.RESOURCE_COLLISION_CHECK_QUEUE)
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DEAD_LETTER_EXCHANGE)
                .build();
    }

    @Bean
    public Binding collisionCheckBinding() {
        return BindingBuilder.bind(collisionCheckQueue())
                .to(iamEventsExchange())
                .with(RabbitMQConstants.RESOURCE_ACCESS_REQUESTED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
