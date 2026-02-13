package com.iam.user.config;

import com.iam.common.config.RabbitMQConstants;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String USER_SYNC_QUEUE = "user.sync.from-auth";

    @Bean
    public TopicExchange iamEventsExchange() {
        return new TopicExchange(RabbitMQConstants.EVENTS_EXCHANGE);
    }

    @Bean
    public Queue userSyncQueue() {
        return new Queue(USER_SYNC_QUEUE, true);
    }

    @Bean
    public Binding userSyncBinding(Queue userSyncQueue, TopicExchange iamEventsExchange) {
        return BindingBuilder.bind(userSyncQueue)
                .to(iamEventsExchange)
                .with(RabbitMQConstants.USER_CREATED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
