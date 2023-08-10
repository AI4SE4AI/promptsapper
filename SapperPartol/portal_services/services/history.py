from .JsonSelfDifin import JsonFile


history_file = JsonFile('../forms/history.json')


def show_history_list(username, role):
    all_user_history = history_file.read_json()
    for user in all_user_history:
        # 如果用户名
        if user["user"] == username and user["role"] == role:  # 找到用户对应角色的历史记录
            # print("/****该用户的history*****/:", user["history"])
            if not user["history"]:
                return {"history": "NULL"}
            else:
                return {"history": user["history"]}
    else:
        return {"history": "NULL"}


def find_single_history(username, role, history_id):
    history = history_file.read_json()
    for user in history:
        if user["user"] == username and user["role"] == role:
            for record in user["history"]:
                if record["history_id"] == history_id:
                    return {"single_history": record["content"]}


def single_history_delete(username, role, history_id):
    history = history_file.read_json()
    for user in history:
        if user["user"] == username and user["role"] == role:
            # print("/******43行找到用户******/")
            for record in user["history"]:
                if record["history_id"] == history_id:
                    # print("/******46行找到历史记录******/", record)
                    user["history"].remove(record)
                    # print("/******48行-删除后的history*****/:", user["history"])
                    break
    history_file.write_json(history)

'''
history.json的数据格式
[
  {"user": "123","role": "translator", "history": [
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
  {"user": "123","role": "translator", "history": []}
  ]
'''
