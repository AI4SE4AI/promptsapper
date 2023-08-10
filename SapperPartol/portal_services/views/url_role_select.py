from flask import Blueprint, render_template, session
from ..services.JsonSelfDifin import JsonFile
from portal_services.services.authentic_login import auth

selectUrl = Blueprint('selectUrl', __name__)
for_roleSelect_show_file = JsonFile('../forms/for_roleSelection_show.json')
users_pass_work_file = JsonFile('../forms/users_pass_work.json')


@selectUrl.route('/roleSelect/', methods=['GET', 'POST'])
@auth
def roleSelect():
    return render_template('roleSelection.html', login_status=True)


@selectUrl.route('/select/<role>', methods=['GET', 'POST'])
@auth
def select(role):
    # print('156行', role)
    username = session.get('username')
    return render_template('chat.html', role=role, username=username, login_status=True)


@selectUrl.route('/select/show', methods=['GET', 'POST'])
@auth
def show():
    # 将for_roleSelection_show.json中的数据取出来传给前端
    data = for_roleSelect_show_file.read_json()
    # print('data', data)
    return data


@selectUrl.route('/user_view_own_roles', methods=['GET', 'POST'])
@auth
def user_view_own_roles():
    username = session.get('username')
    # print('username', username)
    users_pass_work = users_pass_work_file.read_json()
    # print('users_pass_work', users_pass_work)
    # users_pass_work = {"18270182495": [{"role": "test", "count": 10, "count_to_money": 200, "reward_money": 5}], "18270182496": [{"role": "zxc", "count": "10", "count_to_money": "0", "reward_money": "0"}, {"role": "translator", "count": 0, "count_to_money": 0, "reward_money": 0}]}
    user_roles = "NULL"
    for user in users_pass_work:
        if user == username:
            user_roles = users_pass_work[user]
            # print('user_roles', user_roles)
            # user_roles = [{"role": "test", "count": 10, "count_to_money": 200, "reward_money": 5}]
            break
    # print('user_roles', user_roles)
    return user_roles
