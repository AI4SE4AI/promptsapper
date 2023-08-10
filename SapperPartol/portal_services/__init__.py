from flask import Flask, render_template, session
from .views.url_admin import adminUrl
from .views.url_chat import chatUrl
from .views.url_create import createUrl
from .views.url_history import historyUrl
from .views.url_login_register import login_register
from .views.url_role_select import selectUrl
from .views.url_user_balance import balance


def create_app():
    app = Flask(__name__)
    app.secret_key = 'asdgfslakdfjgsdas'

    # app.config.from_object('config')

    @app.route('/')
    def home():
        print(session.get('spl_prompt'))
        # 判断session中是否有username，如果有，说明已经登录，, login_status=True，否则为False
        if session.get('username'):
            login_status = True
        else:
            login_status = False
        return render_template("index.html", login_status=login_status)

    app.register_blueprint(adminUrl)
    app.register_blueprint(chatUrl)
    app.register_blueprint(createUrl)
    app.register_blueprint(historyUrl)
    app.register_blueprint(login_register)
    app.register_blueprint(selectUrl)
    app.register_blueprint(balance)

    return app

