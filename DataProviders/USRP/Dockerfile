FROM ubuntu:20.04

# Update apt, set to non-interactive and install essentials
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install tzdata && \
    apt-get install -y software-properties-common git-all build-essential apt-utils 

# Install apt packages
RUN apt-get -y install git cmake libboost-all-dev libusb-1.0-0-dev python3 python3-docutils python3-mako python3-numpy python3-requests python3-ruamel.yaml python3-setuptools python3-pip

# Install pip packages
RUN pip3 install mako requests python-socketio numpy python-dotenv websocket-client

# Setup manual installation prefix and environment
ARG instprefix=/usr/local
RUN mkdir ${instprefix}/tmp && chmod 0777 ${instprefix}/src
WORKDIR ${instprefix}/src

# Build and install uhd
RUN git clone -b v4.1.0.5 https://github.com/EttusResearch/uhd.git
RUN mkdir uhd/host/build
WORKDIR ${instprefix}/src/uhd/host/build
RUN cmake -DENABLE_DPDK=OFF -DENABLE_PYTHON_API=ON -DENABLE_TESTS=OFF .. > /dev/null
RUN make -j4 &> /dev/null || make
RUN make install
RUN ldconfig


#TODO Uncomment when done dev
# RUN rm -rf ${instprefix}/src
# RUN apt-get autoremove -y && \
#     apt-get clean -y && \
#     rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN mkdir ${instprefix}/rfind
WORKDIR ${instprefix}/rfind
COPY socketio-data-delivery-usrp.py .
COPY ../../.env .


CMD ["/bin/bash"]