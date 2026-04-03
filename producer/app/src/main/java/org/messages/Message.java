package org.messages;

import java.time.Instant;

public interface Message {
    Instant timestamp();
    int status();
    String message();
    String level();
    String service();
}
