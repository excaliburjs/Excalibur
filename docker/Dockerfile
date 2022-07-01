from ubuntu:20.04
# Referenced https://github.com/actions/virtual-environments/blob/main/images/linux/Ubuntu2004-Readme.md
# ubuntu-latest https://github.com/actions/virtual-environments

# Chrome wants a timezone
ENV TZ=America/Chicago 
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt update
# Install Chromium Shared Deps (puppeteer in npm comes with chromium binary)
RUN apt install -y wget curl gnupg libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2

# Install node
RUN curl -sL https://deb.nodesource.com/setup_16.x  | bash -
RUN apt-get -y install nodejs


WORKDIR /opt/app
ADD package.json package-lock.json /opt/app/
RUN npm install