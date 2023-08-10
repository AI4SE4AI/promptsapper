from flask import request, session, Blueprint, render_template, redirect

from ..services.JsonSelfDifin import JsonFile
from portal_services.services.response import Answer

from portal_services.services.authentic_login import auth, get_spl

createUrl = Blueprint('createUrl', __name__)
role_prompt_file = JsonFile('../forms/role_system_prompt.json')
users_work_status_file = JsonFile('../forms/users_work_status.json')
spl_role_prompt_data_file = JsonFile('../forms/spl_role_prompt_data.json')


@createUrl.route('/create', methods=['POST', 'GET'])
# @auth
def create():
    # 查询用户作品状态
    username = session.get('username')
    if username:
        users_work_status = users_work_status_file.read_json()
        # {
        #   "18270182496": {"status": "UnderReview","statement": ""}
        # }
        # 遍历查询用户作品状态status
        for user in users_work_status:
            if user == username:
                status = users_work_status[user]['status']
                if status == '审核已经通过，请在导航栏的角色选择页面中进行查看!':
                    # 删除users_work_status中的用户
                    del users_work_status[user]
                    users_work_status_file.write_json(users_work_status)
                    return render_template('users_create.html', status=status)
                statement = users_work_status[user]['statement']
                return render_template('users_create.html', status=status, statement=statement)

    spl_prompt = session.get('spl_prompt')
    print('spl_prompt', spl_prompt)
    # 如果没有查询到用户作品
    return render_template('users_create.html', spl_prompt=spl_prompt)


@createUrl.route('/user_add_role', methods=['POST', 'GET'])
@auth
def user_add_role():
    # 判断用户是否已经提交过作品，查询用户作品状态，如果已经提交过作品，返回错误信息
    username = session.get('username')
    users_work_status = users_work_status_file.read_json()
    for user in users_work_status:
        if user == username:
            status = users_work_status[user]['status']
            statement = users_work_status[user]['statement']
            return render_template('users_create.html', status=status, statement=statement)

    role = request.form['role']
    # 判断角色是否已经存在，如果存在，返回错误信息
    role_prompt = role_prompt_file.read_json()
    if role in role_prompt:
        return render_template('users_create.html', error='角色名已存在')
    # 判断user_work_status中是否有role，如果有，返回错误信息
    for user in users_work_status:
        if role == users_work_status[user]['role']:
            return render_template('users_create.html', error='您已经提交过该角色的作品，请等待管理员审核！')
    # 判断用户提交的图片名字file.filename.split('.')[0]是否等于角色名role
    file = request.files['file']
    # 强行将file.filename转换为png格式，且名字为role
    file.filename = role + '.png'

    # # 判断图片是否为png
    # if file.filename.split('.')[-1] != 'png':
    #     return render_template('users_create.html', error='图片格式必须为png')
    # if file.filename.split('.')[0] != role:
    #     return render_template('users_create.html', error='图片名字必须和角色英文名一致')

    # 保存prompt和图片
    prompt = request.form['prompt']
    role_prompt[role] = prompt
    role_prompt_file.write_json(role_prompt)
    file.save('portal_services/static/images/role/' + file.filename)

    # 将图片路径存入photo_path
    photo_path = '../static/images/role/' + file.filename
    # 将role和Chinese存入user_work_status
    Chinese_name = request.form['Chinese']
    users_work_status[username] = {'role': role, 'chinese': Chinese_name, 'status': '您的作品在审核中！', 'statement': '', 'photo_path': photo_path}
    users_work_status_file.write_json(users_work_status)
    # 将username,role，session中的session['spl_prompt']，session['spl_data']保存至文件spl_role_prompt_data_file
    # {"username":uername"role":role,"spl_prompt":session['spl_prompt'],"spl_data":session['spl_data']}
    return render_template('users_create.html', success='您的作品已经提交成功！请等待管理员审核。')


@createUrl.route('/test', methods=['POST', 'GET'])
@auth
def test():
    return render_template('test.html')


@createUrl.route('/sapper_spl', methods=['POST'])
@get_spl
def sapper_spl():
    # data = request.form
    data = request.get_json()
    spl_prompt = data['spl_prompt']
    spl_data = data['spl_data']
    # print(data)
    # # 将spl_prompt和spl_data存入session
    # session['spl_prompt'] = spl_prompt
    # session['spl_data'] = spl_data
    # # 取出session中的spl_prompt和spl_data
    # spl_prompt = session.get('spl_prompt')
    # spl_data = session.get('spl_data')
    # print("session", spl_prompt, spl_data)
    print("qqqqqqq")
    # 重定向到/create
    # return redirect('/create')
    return redirect('/sapper_spl_create?spl_prompt=' + spl_prompt + '&spl_data=' + spl_data)`


@createUrl.route('/sapper_spl_create', methods=['POST', 'GET'])
# @auth
def user_add_statement():
    # 获取url中的spl_prompt和spl_data
    spl_prompt = request.args.get('spl_prompt')
    spl_data = request.args.get('spl_data')
    return render_template('users_create.html', spl_prompt=spl_prompt)
