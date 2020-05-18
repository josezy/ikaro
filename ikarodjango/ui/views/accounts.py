from django.conf import settings
from django.views import View
from django.urls import reverse
from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password

from ikaro.models import User


def safe_next_url(next_url: str) -> str:
    # send them to the homepage if no next is specified
    next_url = next_url or '/'
    # dont allow outside redirects like https://attacker.com,
    #   //attacker.com or ftp://attacker.com
    if next_url.startswith('//') or not next_url.startswith('/'):
        next_url = '/'

    return next_url


class Logout(View):
    def get(self, request):
        next_url = safe_next_url(request.GET.get('next', reverse('home')))

        if request.user.is_authenticated:
            logout(request)

        return redirect(next_url)


class Login(View):
    template = 'ui/login.html'

    def get(self, request):
        next_url = safe_next_url(request.GET.get('next'))

        if request.user.is_authenticated:
            return redirect(next_url)

        return render(request, self.template, {'next': next_url})

    def post(self, request):
        email = request.POST.get('email')
        password = request.POST.get('password')
        next_url = safe_next_url(request.POST.get('next'))

        if request.user.is_authenticated:
            return redirect(next_url)

        if not (email and password):
            return render(request, self.template, {
                'login_errors': 'Missing email or password.',
                'next': next_url,
            })

        user = authenticate(email=email, password=password)
        if not user:
            return render(request, self.template, {
                'login_errors': 'Incorrect email or password',
                'next': next_url,
            })

        login(request, user)
        return redirect(next_url)


class Signup(View):
    template = 'ui/signup.html'

    def get(self, request):
        next_url = safe_next_url(request.GET.get('next'))

        # they're already logged in
        if request.user.is_authenticated:
            return redirect(next_url)

        return render(request, self.template, {'next': next_url})

    def post(self, request):
        first_name = request.POST.get('first_name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        next_url = safe_next_url(request.POST.get('next'))

        # they're already logged in
        if request.user.is_authenticated:
            return redirect(next_url)

        # they tried to log in using the signup page
        user = authenticate(email=email, password=password)
        if user:
            login(request, user)
            return redirect(next_url)

        error = validate_signup_form(email, password, password2)
        if error:
            return render(request, self.template, {
                'signup_errors': error,
                'first_name': first_name,
                'email': email,
                'next': next_url,
            })

        # create a new user account and log them in
        user = User.objects.create_user(
            first_name=first_name,
            username=email,
            email=email or '',
            password=password
        )

        # send_signup_email.send(user.username)
        login(request, user)
        return redirect(next_url)


def validate_signup_form(email, password, password2):
    # they're missing a email or password
    if not (email and password):
        return 'Missing email or password.'

    # re-typed password dont match
    if (not settings.DEBUG) and (not password == password2):
        return 'Passwords do not match.'

    # user already exists with that email
    if User.objects.filter(email=email).exists():
        return mark_safe(
            'That email is already in use with a different account.\n'
            'Did you mean to <a href="/accounts/login/">log in</a> '
            'to an existing account?'
        )

    # check the password validity
    user = User(username=email, email=(email or ''))
    try:
        if not settings.DEBUG:
            validate_password(password, user=user)
    except ValidationError as e:
        errs = ', '.join(e.messages)
        msg = f'Try another password, that one is not valid. {errs}'
        return msg

    return None
