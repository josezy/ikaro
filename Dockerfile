FROM python:latest

WORKDIR /opt/ikaro

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./requirements.txt /opt/ikaro/requirements.txt
RUN pip install --upgrade pip &&\
    pip install -r requirements.txt

WORKDIR /opt/ikaro/ikarodjango
