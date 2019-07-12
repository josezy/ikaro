FROM python:3.7-alpine

WORKDIR /opt/ikaro

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip
RUN pip install pipenv
COPY ./Pipfile /opt/ikaro/Pipfile
RUN pipenv install --skip-lock --system

COPY . /opt/ikaro/
