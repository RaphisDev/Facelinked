import java.io.IOException;
import java.nio.charset.StandardCharsets;
//
//import software.amazon.awssdk.core.ResponseInputStream;
//import software.amazon.awssdk.services.s3.S3Client;
//import software.amazon.awssdk.services.s3.model.GetObjectResponse;
//
//import org.springframework.stereotype.Component;
//import org.springframework.util.StreamUtils;
//
//@Component
//class S3Client
//{
//    private final S3Client s3Client;h
//
//    S3Client(S3Client s3Client) {
//        this.s3Client = s3Client;
//    }
//
//    void readFile() throws IOException
//    {
//        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(
//                request -> request.bucket("bucket-name").key("file-name.txt"));
//
//        String fileContent = StreamUtils.copyToString(response, StandardCharsets.UTF_8);
//
//        System.out.println(fileContent);
//    }
//}
