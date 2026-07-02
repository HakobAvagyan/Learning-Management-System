package com.lms.mediaservice.service;

import com.lms.mediaservice.dto.PresignedUrlResponse;
import com.lms.mediaservice.dto.UploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.presigned-url-expiry-minutes}")
    private int defaultExpiryMinutes;

    public UploadResponse upload(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "file";
        String key = UUID.randomUUID() + "/" + originalFilename;
        String contentType = file.getContentType() != null
                ? file.getContentType() : "application/octet-stream";

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .contentLength(file.getSize())
                        .build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );

        return new UploadResponse(key, bucket, originalFilename, file.getSize(), contentType);
    }

    public PresignedUrlResponse presign(String key, int expiryMinutes) {
        int minutes = expiryMinutes > 0 ? expiryMinutes : defaultExpiryMinutes;
        Duration duration = Duration.ofMinutes(minutes);

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(duration)
                .getObjectRequest(r -> r.bucket(bucket).key(key))
                .build();

        String url = s3Presigner.presignGetObject(presignRequest).url().toString();
        return new PresignedUrlResponse(url, key, Instant.now().plus(duration));
    }
}