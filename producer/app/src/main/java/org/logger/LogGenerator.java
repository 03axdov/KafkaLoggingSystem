package org.logger;

import java.time.Instant;
import java.util.Random;

import org.messages.Message;
import org.messages.LogMessage;

public class LogGenerator {

    private static final Random random = new Random();

    private static final String[] levels = {
        "INFO", "WARN", "ERROR", "DEBUG"
    };

    private static final String[] services = {
        "AuthService", "PaymentService", "OrderService", "UserService"
    };

    private static final String[] messages = {
        "Request successful",
        "User login failed",
        "Database timeout",
        "Payment processed",
        "Invalid input",
        "Connection lost",
        "Retrying request"
    };

    public static Message generateRandomMessage() {
        Instant timestamp = Instant.now();
        int status = random.nextInt(600); // 0–599
        String level = levels[random.nextInt(levels.length)];
        String service = services[random.nextInt(services.length)];
        String message = messages[random.nextInt(messages.length)];

        return new LogMessage(timestamp, status, message, level, service);
    }
}