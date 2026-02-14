package com.iam.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import java.net.URI;

@Configuration
public class RootRedirectConfig {

    @Bean
    public RouterFunction<ServerResponse> rootRedirect() {
        return RouterFunctions.route()
                .GET("/", request -> ServerResponse.permanentRedirect(URI.create("/swagger-ui.html")).build())
                .build();
    }
}
