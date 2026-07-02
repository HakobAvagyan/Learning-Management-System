package com.lms.progressservice.config;

import com.lms.progressservice.dto.QuizPassedEvent;
import com.lms.progressservice.dto.StudentEnrolledEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.util.backoff.FixedBackOff;

import java.util.Map;

@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;


    @Bean
    public ConsumerFactory<String, StudentEnrolledEvent> consumerFactory() {
        JsonDeserializer<StudentEnrolledEvent> deserializer =
                new JsonDeserializer<>(StudentEnrolledEvent.class, false);
        deserializer.addTrustedPackages("com.lms.*");

        return new DefaultKafkaConsumerFactory<>(
                baseProps(groupId),
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, StudentEnrolledEvent>
    kafkaListenerContainerFactory(ConsumerFactory<String, StudentEnrolledEvent> consumerFactory) {

        ConcurrentKafkaListenerContainerFactory<String, StudentEnrolledEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        factory.setCommonErrorHandler(new DefaultErrorHandler(new FixedBackOff(2000L, 3)));
        return factory;
    }


    @Bean
    public ConsumerFactory<String, QuizPassedEvent> quizPassedConsumerFactory() {
        JsonDeserializer<QuizPassedEvent> deserializer =
                new JsonDeserializer<>(QuizPassedEvent.class, false);
        deserializer.addTrustedPackages("com.lms.*");

        return new DefaultKafkaConsumerFactory<>(
                baseProps(groupId + "-quiz"),
                new StringDeserializer(),
                deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, QuizPassedEvent>
    quizPassedListenerContainerFactory(ConsumerFactory<String, QuizPassedEvent> quizPassedConsumerFactory) {

        ConcurrentKafkaListenerContainerFactory<String, QuizPassedEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(quizPassedConsumerFactory);
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
        factory.setCommonErrorHandler(new DefaultErrorHandler(new FixedBackOff(2000L, 3)));
        return factory;
    }


    private Map<String, Object> baseProps(String consumerGroupId) {
        return Map.of(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG,  bootstrapServers,
                ConsumerConfig.GROUP_ID_CONFIG,           consumerGroupId,
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG,  "earliest",
                ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false
        );
    }
}