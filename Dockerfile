FROM python:latest

WORKDIR /opt/ikaro

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY ./Pipfile /opt/ikaro/Pipfile
RUN pip install --upgrade pip &&\
    pip install pipenv &&\
    pipenv install --skip-lock --system

COPY . /opt/ikaro/
WORKDIR /opt/ikaro/ikarodjango
