let _box = null
const Barrage = class {
    propsId = null
    chatDom = null
    roomJoinDom = null
    ws = null
    observer = null
    chatObserverrom = null
    option = {}
    constructor() {
        _box = document.getElementById('_chatDiv_list')
        this.propsId = Object.keys(document.querySelector('.webcast-chatroom___list'))[1]
        this.chatDom = document.querySelector('.webcast-chatroom___items').children[0]
        this.roomJoinDom = document.querySelector('.webcast-chatroom___bottom-message')
    }
    runServer() {
        let _this = this
        this.chatObserverrom = new MutationObserver((mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    let b = mutation.addedNodes[0]
                    if (b[this.propsId].children.props.message) {
                        let message = this.messageParse(b)
                        if (message && !message.isGift) {
                            insertDom(message)
                        }
                    }
                }
            }
        });
        this.chatObserverrom.observe(this.chatDom, { childList: true });
        console.log('安装完成 √')
    }
    getUser(user) {
        if (!user) {
            return
        }
        let msg = {
            user_level: this.getLevel(user.badgeImageList, 1),
            user_fansLevel: this.getLevel(user.badgeImageList, 7),
            user_id: user.id,
            user_nickName: user.nickname,
            user_avatar: user.avatarThumb.urlList[0],
            user_gender: user.gender === 1 ? '男' : '女',
            user_isAdmin: user.userAttr.isAdmin,
            user_fansLightName: "",
            user_levelImage: ""
        }
        return msg
    }
    getLevel(arr, type) {
        if (!arr || arr.length === 0) {
            return 0
        }
        let item = arr.find(i => {
            return i.imageType === type
        })
        if (item) {
            return parseInt(item.content.level)
        } else {
            return 0
        }
    }
    messageParse(dom) {
        if (!dom[this.propsId].children.props.message) {
            return null
        }
        let msg = dom[this.propsId].children.props.message.payload
        let result = {
            gift_id: null,
            gift_name: null,
            gift_number: null,
            gift_image: null,
            gift_diamondCount: null,
            gift_describe: null,
        }
        result = Object.assign(result, this.getUser(msg.user))
        switch (msg.common.method) {
            case 'WebcastGiftMessage':
                result = Object.assign(result, {
                    msg_content: msg.common.describe,
                    isGift: true,
                    gift_id: msg.gift.id,
                    gift_name: msg.gift.name,
                    gift_number: parseInt(msg.comboCount),
                    gift_image: msg.gift.icon.urlListList[0],
                    gift_diamondCount: msg.gift.diamondCount,
                    gift_describe: msg.gift.describe,
                })
                break
            case 'WebcastChatMessage':
                result = Object.assign(result, {
                    isGift: false,
                    msg_content: msg.content
                })
                break
            default:
                result = Object.assign(result, {
                    isGift: false,
                    msg_content: msg.content
                })
                break
        }
        return result
    }
}
document.querySelector('.basicPlayer').remove()

console.log('脚本安装中..')
let bar = new Barrage()

bar.runServer()

let chatTemplate = `<div style="display: flex; align-items: center; margin-bottom: 12px;" class="chat-bubble">
  <img src="{src}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 8px;" class="avatar">
  <div style="display: flex; flex-direction: column; padding: 8px; background-color: #F5F5F5; border-radius: 8px;" class="message">
    <div style="font-weight: bold; margin-bottom: 4px;" class="user-name">{nick}</div>
    <div style="margin-bottom: 4px;" class="text">{text}</div>
    <div style="font-size: 12px; color: #888888;" class="time">{time}</div>
  </div>
</div>`

function insertDom(msg) {
    console.log(msg)
    let item = document.createElement('li')
    item.innerHTML = chatTemplate.replace('{src}', msg.user_avatar).replace('{nick}', msg.user_nickName).replace('{text}', msg.msg_content)
    _box.appendChild(item)
}