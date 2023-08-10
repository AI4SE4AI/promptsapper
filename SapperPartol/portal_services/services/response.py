import json
import datetime
import flask
import openai
import sys
import traceback
import re
from .JsonSelfDifin import JsonFile

users_file = JsonFile('../forms/users_pwd_tokens.json')
history_file = JsonFile('../forms/history.json')
role_use_count_file = JsonFile('../forms/role_use_count.json')
role_prompt_file = JsonFile('../forms/role_system_prompt.json')
api_key_file = JsonFile('../forms/api_key.json')
users_pass_work_file = JsonFile('../forms/users_pass_work.json')

'''
前端的数据格式：
from_front = {
    "query": "你好",
    'history_id': 'history_1',
    'new_old': 'new'
}

history.json的数据格式
  [
  {"user": "123", "role": role_1, "history": [
                                              {"history_id": "id_1",
                                              "content":[
                                                          {"role": "user","content": "你好"},
                                                          {"role": "assistant", "content": "天色更好。"}
                                              ]},
                                              {"history_id": "id_2",
                                              "content": [
                                                          {"role": "user","content": "你好"},
                                                          {"role": "assistant", "content": "你好，我是小助手，有什么可以帮到你的吗？"}
                                              ]}]
  },
  {"user": "123", "role": role_2, "history": [
                                              {"history_id": "id_1",
                                              "content":[
                                                          {"role": "user","content": "你好"},
                                                          {"role": "assistant", "content": "天色更好。"}
                                              ]},
                                              {"history_id": "id_2",
                                              "content": [
                                                          {"role": "user","content": "你好"},
                                                          {"role": "assistant", "content": "你好，我是小助手，有什么可以帮到你的吗？"}
                                              ]}]
  }
  {"user": "666", "history": []}
  ]
'''


def Answer(from_font, session_user, role):
    balance_tokens = 0
    users = users_file.read_json()
    username = session_user
    # 获取用户的tokens
    for user in users:
        if user["user"] == username:
            balance_tokens = user["tokens"]
            # tokens少于0多少不能聊天
            if balance_tokens < 0:
                return "使用次数不足"

    # 前端只传当前用户在input输入的query。所以现在的prompt有三部分组成：system_prompt,history_prompt,from_font["query"]
    data_dict = role_prompt_file.read_json()
    # print("data_dict:")
    # for key, value in data_dict.items():
    #     print(key, ":", str(value).encode('gbk', errors='ignore').decode('gbk'))

    system_prompt = data_dict.get(role)
    system_prompt = [
        {"role": "system", "content": system_prompt}
    ]
    prompt_chat_history = merge_prompt(from_font, username, role)
    # prompt_chat_history是完整用户聊天上下文；最终的history.json存prompt+answer

    # 以下是基于完整的prompt，调用gpt3.5，获得answer
    try:
        system_prompt.extend(prompt_chat_history)
        # 此时的system_prompt将作为传给gpt的prompt，为：角色的设定 + 用户的历史记录

        def stream():
            response = chatgpt(system_prompt)
            answer = ''
            for chunk in response:
                if chunk["choices"][0]["finish_reason"] is not None:
                    data = "[DONE]"  # 代表对话结束的自定义标识于前端一致，将返回给前端

                    # 保存记录的工作
                    write_role_count(role, username)
                    write_balance_tokens(username, balance_tokens)
                    write_bill(username, role)
                    write_history(prompt_chat_history, username, role, from_font, answer)

                else:
                    data = chunk["choices"][0]["delta"].get("content", "")
                    answer += data
                yield "data: %s\n\n" % data.replace("\n", "<br>")

        stream()
        return flask.Response(stream(), mimetype='text/event-stream')

    except:
        error = log_error()
        return error


def chatgpt(system_prompt):
    key_json = api_key_file.read_json()
    openai.api_key = key_json["api_key"]
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-16k",
        messages=system_prompt,
        stream=True
    )
    return response


def write_history(prompt_file, username, role, from_font, answer):
    # 查找历史文件中的用户,找到对应的历史记录，将新的记录覆盖旧的记录
    current_history = prompt_file
    current_history.extend([{"role": "assistant", "content": answer}])  # 这就是加上这次模型回答的历史记录
    has_user_role = False
    has_history_id = False
    history = history_file.read_json()
    for user in history:
        if user["user"] == username and user["role"] == role:
            has_user_role = True
            # 如果user["history" ]为空，直接赋值
            if not user["history"]:
                user["history"].append(
                    {"history_id": from_font["history_id"], "content": current_history})
                # print("response.py/*****92行存入文件*****/:", user["history"])
                history_file.write_json(history)
            else:  # 用户有历史记录，覆盖旧的记录
                for record in user["history"]:
                    if record["history_id"] == from_font["history_id"]:
                        has_history_id = True
                        # print("有相同的history_id")
                        record["content"] = current_history
                        # print("/*****102行存入文件*****/:", user["history"])
                        history_file.write_json(history)
                        break
                if not has_history_id:
                    # print("没有记录history_id")
                    user["history"].append(
                        {"history_id": from_font["history_id"], "content": current_history})
                    # print("/*****189行存入文件*****/:", user["history"])
                    history_file.write_json(history)
    # 如果没找到，将用户和对应角色加入历史记录
    if not has_user_role:
        new_user = {"user": username, "role": role, "history": [
            {"history_id": from_font["history_id"], "content": current_history}]}
        # 把new_history加入history
        history.append(new_user)
        # 保存历史记录到文件
        history_file.write_json(history)


def merge_prompt(from_font, username, role):
    prompt_file = []
    if from_font["new_old"] == 'new':
        # 如果是新的对话，将from_font["query"]写入prompt
        prompt_file.extend([{"role": "user", "content": from_font["query"]}])
    else:
        # 如果是旧的对话，将history_prompt写入prompt
        # 根据session_user找history.json中的user；
        history = history_file.read_json()
        history_prompt = []
        for user in history:
            if user["user"] == username and user["role"] == role:
                # 找到对应from_font['history_id']在文件中的历史记录
                for history_id in user["history"]:
                    if history_id["history_id"] == from_font["history_id"]:
                        history_prompt = history_id["content"]
        prompt_file.extend(history_prompt)
        prompt_file.extend([{"role": "user", "content": from_font["query"]}])
    return prompt_file


def write_role_count(role, username):
    # role_use_count_file写入角色使用次数加一
    role_use_count = role_use_count_file.read_json()
    # role_use_count =  [
    #   {"role": "wanneng", "count": 0},
    #   {"role": "xingzuo", "count": 0},
    #   {"role": "translator", "count": 0}
    # ]
    for role_count in role_use_count:
        if role_count["role"] == role:
            role_count["count"] = role_count["count"] + 1
            role_use_count_file.write_json(role_use_count)

    # users_pass_work_file写入角色使用次数加一,为了实现奖励机制
    users_pass_work = users_pass_work_file.read_json()
    # users_pass_work = {"18270182495": [{"role": "test", "count": 10, "count_to_money": 200, "reward_money": 5}], "18270182496": [{"role": "zxc", "count": 0, "count_to_money": 0, "reward_money": 0}, {"role": "translator", "count": 0, "count_to_money": 0, "reward_money": 0}]}
    for user in users_pass_work:
        if user == username:
            for user_role in users_pass_work[user]:
                if user_role["role"] == role:
                    user_role["count"] = str(int(user_role["count"]) + 1)
                    users_pass_work_file.write_json(users_pass_work)
                    break


def write_balance_tokens(username, balance_tokens):
    # 从这里开始存聊天内容等存文件操作
    # 用户的balance_tokens减去当前聊天消耗的tokens，写入文件
    users = users_file.read_json()
    for _user in users:
        if _user["user"] == username:
            _user["tokens"] = balance_tokens - 1
            # print("user_tokens:", _user["tokens"])
            users_file.write_json(users)


def write_bill(username, role):
    # 存入用户账单，'portal_services/forms/users_bill/{username}_bill.json'
    # 存入数据为：{"2023-06-21": {"role_1":3,"role_2":5},"2023-6-22":{"role_4":3,"role_2":7}},每天的角色使用次数记录在一个键值对的值中，所以先判断键改天是否有值，有值则加一，无值则新建键值对
    # 读取用户账单
    with open(f'portal_services/forms/users_bill/{username}_bill.json', 'r', encoding='utf-8') as f:
        user_bill = json.load(f)
    # print("user_bill:", user_bill)
    # 判断今天是否有值
    today = datetime.date.today()
    today = str(today)
    # print("today:", today)
    if today in user_bill:
        # print("today in user_bill")
        # 判断今天是否有role
        if role in user_bill[today]:
            # print("role in user_bill[today]")
            user_bill[today][role] = user_bill[today][role] + 1
        else:
            # print("role not in user_bill[today]")
            user_bill[today][role] = 1
    else:
        # print("today not in user_bill")
        user_bill[today] = {role: 1}
    # print("user_bill:", user_bill)
    # 写入用户账单
    with open(f'portal_services/forms/users_bill/{username}_bill.json', 'w', encoding='utf-8') as f:
        json.dump(user_bill, f, ensure_ascii=False)


def log_error():
    # 使用 sys.exc_info() 获取当前异常的相关信息
    exc_type, exc_value, exc_traceback = sys.exc_info()
    # 使用 traceback.format_exception() 格式化异常信息
    error = traceback.format_exception(exc_type, exc_value, exc_traceback)
    # 将格式化后的异常信息写入文件
    line = str(error)
    # print("/****14行error****/:", error)
    matchObj = re.search(r'openai.error.', line, re.M | re.I).start()
    long_error = line[matchObj:-4]
    pattern = r'(?:[^.]*\.){3}'  # 匹配前三个点之前的内容
    match = re.search(pattern, long_error, re.M | re.I).end()
    brief_error = long_error[:match]
    # print("/****22行error****/:", brief_error)
    return brief_error
