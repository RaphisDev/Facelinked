#import <UserNotifications/UserNotifications.h>

@interface NotificationService : UNNotificationServiceExtension
@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;
@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request
                   withContentHandler:(void (^)(UNNotificationContent *contentToDeliver))contentHandler {
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];

    NSDictionary *userInfo = request.content.userInfo;
    NSString *imageUrlString = userInfo[@"profile_picture"];

    if (imageUrlString) {
        NSURL *imageURL = [NSURL URLWithString:imageUrlString];
        NSURLSessionDownloadTask *task = [[NSURLSession sharedSession] downloadTaskWithURL:imageURL completionHandler:^(NSURL * _Nullable location, NSURLResponse * _Nullable response, NSError * _Nullable error) {
            if (location) {
                NSString *tmpSubFolderName = [[NSProcessInfo processInfo] globallyUniqueString];
                NSString *tmpSubFolderURL = [NSTemporaryDirectory() stringByAppendingPathComponent:tmpSubFolderName];
                [[NSFileManager defaultManager] createDirectoryAtPath:tmpSubFolderURL withIntermediateDirectories:YES attributes:nil error:nil];
                NSString *fileURL = [tmpSubFolderURL stringByAppendingPathComponent:[imageURL lastPathComponent]];
                [[NSFileManager defaultManager] moveItemAtPath:location.path toPath:fileURL error:nil];
                UNNotificationAttachment *attachment = [UNNotificationAttachment attachmentWithIdentifier:@"profile_picture" URL:[NSURL fileURLWithPath:fileURL] options:nil error:nil];
                if (attachment) {
                    self.bestAttemptContent.attachments = @[attachment];
                }
            }
            self.contentHandler(self.bestAttemptContent);
        }];
        [task resume];
    } else {
        self.contentHandler(self.bestAttemptContent);
    }
}

- (void)serviceExtensionTimeWillExpire {
    self.contentHandler(self.bestAttemptContent);
}

@end
