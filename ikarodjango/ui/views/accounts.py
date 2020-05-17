from django.conf import settings
from django.views import View
from django.urls import reverse
from django.shortcuts import render, redirect
from django.utils.safestring import mark_safe
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password

from ikaro.models import User


# We dont want people getting a username like "mavlink" or "drone"
BANNED_USERNAMES = {
    'mavlink', 'drone', 'dji', 'pixhawk', 'px4', 'ardupilot', 'autopilot',
    'username', 'admin', 'administrator', 'password', 'system', 'beta',
    'prod', 'dev', 'ikaro', 'hack', 'hacker'
}
ALLOWED_USERNAME_SYMBOLS = '-_.'
MAX_USERNAME_LEN = 15


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
        username = request.POST.get('username')
        password = request.POST.get('password')
        next_url = safe_next_url(request.POST.get('next'))

        if request.user.is_authenticated:
            return redirect(next_url)

        if not (username and password):
            return render(request, self.template, {
                'login_errors': 'Missing username or password.',
                'next': next_url,
            })

        user = authenticate(username=username, password=password)
        if not user:
            return render(request, self.template, {
                'login_errors': 'Incorrect username or password',
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
        username = request.POST.get('username')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        email = request.POST.get('email')
        next_url = safe_next_url(request.POST.get('next'))

        # they're already logged in
        if request.user.is_authenticated:
            return redirect(next_url)

        # they tried to log in using the signup page
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return redirect(next_url)

        error = validate_signup_form(username, password, password2, email)
        if error:
            return render(request, self.template, {
                'signup_errors': error,
                'username': username,
                'email': email,
                'next': next_url,
            })

        # create a new user account and log them in
        user = User.objects.create_user(
            username=username,
            email=email or '',
            password=password
        )

        # send_signup_email.send(user.username)
        login(request, user)
        return redirect(next_url)


def validate_username(username: str):
    if '@' in username:
        raise ValidationError(
            'Username cannot contain @ symbol to avoid confusion '
            'with emails.'
        )

    if not (2 < len(username) <= MAX_USERNAME_LEN):
        raise ValidationError(
            'Username must be between 3 and '
            f'{MAX_USERNAME_LEN} characters long.'
        )
    # reserved or confusing word
    if username.lower() in BANNED_USERNAMES:
        raise ValidationError(
            'That username is not allowed because it could cause '
            'confusion for players.'
        )
    # only letters, nums, -, or _
    if not all(char.isalnum() or char in ALLOWED_USERNAME_SYMBOLS
               for char in username):
        raise ValidationError(
            'Username can only contain characters a-Z 0-9 - and _.'
        )
    # has characters other than symbols
    if len(username) == sum(username.count(s)
                            for s in ALLOWED_USERNAME_SYMBOLS):
        raise ValidationError(
            "Username must contain at least one character "
            "that isn't a symbol."
        )
    return True


def validate_signup_form(username, password, password2, email):
    # they're missing a username or password
    if not (username and password):
        return 'Missing username or password.'

    if username in ('cowpig', 'squash'):
        # blitzka manage create_superuser
        return 'Hah, nice try. You can only create these users from the CLI.'

    # they're missing an email address
    if (not settings.DEBUG) and not email:
        return 'Missing an email address.'

    # re-typed password dont match
    if (not settings.DEBUG) and (not password == password2):
        return 'Passwords do not match.'

    # their username choice is invalid
    try:
        for validator in [validate_username]:
            validator(username)
    except ValidationError as e:
        return e.message

    # user already exists with that username
    if User.objects.filter(username__iexact=username).exists():
        return mark_safe(
            'That username is already taken, try a different username.\n'
            'Or, log in <a href="/accounts/login/">here</a> '
            'if you already have an account.'
        )

    # user already exists with that email
    if User.objects.filter(email=email).exists():
        return mark_safe(
            'That email is already in use with a different account.\n'
            'Did you mean to <a href="/accounts/login/">log in</a> '
            'to an existing account?'
        )

    # check the password validity
    user = User(username=username, email=(email or ''))
    try:
        if not settings.DEBUG:
            validate_password(password, user=user)
    except ValidationError as e:
        errs = ', '.join(e.messages)
        msg = f'Try another password, that one is not valid. {errs}'
        return msg

    return None
