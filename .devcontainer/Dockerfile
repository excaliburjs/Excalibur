FROM mcr.microsoft.com/playwright:v1.55.0-noble

# Install Xvfb + a dbus shim some apps probe for
RUN apt-get update && \
    apt-get install -y --no-install-recommends xvfb dbus-x11 && \
    rm -rf /var/lib/apt/lists/*

# Default display for the virtual X server
ENV DISPLAY=:99