package org.messages;

import java.time.Instant;

public record LogMessage(
    Instant timestamp,
    int status,
    String message,
    String level,
    String service
) implements Message {}