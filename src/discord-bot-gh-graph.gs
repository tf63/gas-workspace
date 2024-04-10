// パラメータ
const USERNAME = ''
const GITHUB_TOKEN = '' // 追加
const DISCORD_URL = ''
const GITHUB_URL = 'https://api.github.com/graphql'

let todayUTC = new Date()
todayUTC.setHours(todayUTC.getHours() + 9)
const TODAY = todayUTC.toISOString() // 変更 2000-01-01T00:00:00.000Zのような形式の日付

// GraphQLのクエリ
// 今日のContribution数を取得する
const query = `query contributions {
                          user(login: "${USERNAME}") {
                            contributionsCollection(to: "${TODAY}", from: "${TODAY}") {
                              contributionCalendar {
                                weeks {
                                  contributionDays {
                                    date
                                    contributionCount
                                  }
                                }
                              }
                            }
                          }
                        }
`

// Github APIからContribution数を取得する
function getNumOfContributions() {
    // リクエストのオプション
    let options = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        payload: JSON.stringify({ query })
    }

    // Github APIからデータを取得する
    let response = UrlFetchApp.fetch(GITHUB_URL, options)

    // Contribution数を取得する
    if (response.getResponseCode() === 200) {
        // 正しくレスポンスが返ってきた場合

        // レスポンスをパース
        let datas = JSON.parse(response.getContentText())

        // 適当にcontribution数を取り出す
        let contribution =
            datas.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays[0].contributionCount

        return contribution
    } else {
        // レスポンスが返ってこなかった場合，エラーを投げる
        throw new Error('Github APIにアクセスできませんでした．')
    }
}

// DiscordのWebhookにメッセージを登録
function postMessage(message) {
    // 登録するメッセージ
    let payload = {
        content: message
    }

    // リクエストのオプション
    let options = {
        method: 'POST',
        payload: payload
    }

    // Webhookにリクエストを投げる
    UrlFetchApp.fetch(DISCORD_URL, options)
}

// エントリポイント
function main() {
    try {
        // 今日のContribution数を取得してメッセージを送信する
        let contribution = getNumOfContributions()

        postMessage(`【${TODAY.slice(0, 10)}のContribution数】 ${contribution}`)
    } catch (e) {
        // エラーが生じた場合，その内容を送信する
        console.error(e)
        postMessage(`【エラーが発生しました】 ${e}`)
    }
}
