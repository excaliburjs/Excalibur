# Referenced https://github.com/actions/virtual-environments/blob/main/images/linux/Ubuntu2004-Readme.md
# ubuntu-latest https://github.com/actions/virtual-environments
from ubuntu:20.04

RUN apt update
RUN apt install -y wget curl gnupg
# Install node
RUN curl -sL https://deb.nodesource.com/setup_16.x  | bash -
RUN apt-get -y install nodejs

# Chrome wants a timezone
ENV TZ=America/Chicago 
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \ 
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get -y install google-chrome-stable

WORKDIR /opt/app
ADD package.json package-lock.json /opt/app/
RUN npm install