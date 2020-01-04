import Axios, * as axios from "axios";
import * as cheerio from "cheerio";
import * as admin from "firebase-admin";

interface NotifModel {
  title: string;
  url: string;
  department: string;
  post_date: number;
  desc: string | undefined;
}

//파이어베이스 세팅
class Setting {
  static setFirestore(): FirebaseFirestore.Firestore {
    //파이어베이스 연동 정보
    const serviceAccount: any = {
      type: "service_account",
      project_id: "link-prod-3ecd0",
      private_key_id: "828a6ec33bdf72391f2686f79adcbdf04ecdaf30",
      private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDyAxu1ioVNwElZ\n9go4ZNd3Isa1yYShUfPg09q9ngsQAbd8o1HQTsj3Iprea2bTYMBluLEhtWCNeMen\njW3YHTucacgg92qTNcmaQDe+ODcSvJYP9Ngt8G9hirQd1xGAuTyzZXCkQwQpKLAn\nkTo942EpUQ1fluh7oyvHkYWm6XHy0CR1PefEaYa+IDhmYwL8ee7zk6Hol3ILu1cs\n9OMUvINy/kOE2k8mkbOi9YsYcPdzQ72Ic982+rmd3p3HLXplbcj12Hs9q5PhjO7o\nVo8Zck+3r7utBjmcjlvI3NoKxJZutuH0JtYi58aooRkbkTPDUY4emma2lq5hgPdm\nUBpAE9kpAgMBAAECggEAC8N6FL5gNunhFuHxArySGvIiNw1jKJqXcGb+g7Iw3E0S\nZRj6Myt/32q7nOfwZldrsAtvdBGWg8yVEIWnyyC2ovvNqh6PUWBaBZOtXKNrt+SE\npc9otP5HfQtf2xshuGr98plnGtuVZ5vDnj9pVZSdxoNFqLm+Ngj11JGercDnVJ5Q\nZniY0ei4G9VyUwci9kWvevb8YSzCU6iqg2W7t4CaioHKDE+seBMXK4kecrqvkwPO\ndELoEEX0emwwS/y/cap3aAB2cDe5/5fa6HEFVvTH/gcAUSCCW4x7mLLa7bGkB5fV\ngyUUoSRgQoIZpzwatw3QCXhpPdgoYYOn8evBykPtlQKBgQD/q16ctlmvlilldEi8\nnxsBOPzCEBw9nr68mgzXrUOeGy6JwSLpKPV/epb1WnpnG5CX7zmhX3eeTNvSzvrk\nFr+Z6UPRCtLdNZmIAqE19/IA1plmhr+o+nb7ICeFwgRoVavplhP/ZxeXuHuiyfF6\nNDA9qvUHjovxu38O+qHCgmxHFQKBgQDyUzfIKi3Cr7KqDo+GHod8BksJ3LBq8BkV\nw4aW9fLQpBGNFqpq4SaItxiVjaefuPRDQN4DblSCjtsu+rZHfhTET5D6zPe6tgIA\nPpMOz6tmU61mJHmK46qK0+uR8djTmRqh33E8R60c+tGm1KIvxbh0XvT5LuhYDFNR\nYyqgMuYOxQKBgELCo+T19LtV0Z9tWuTuAuYx1EZ0YHtyrUmgTEQxORva6y8LYKtT\nh69u+mY85wNvfjU+QWUzAZAzb58/buIKUqPE9nFqix86NMoALcpi4S142/uaqgdc\nx57RiaByxiXcYRSQnM4vREjY4mfipYyMfiBMOMltXnuTwxzNM1oQJmf1AoGBAIb1\nuheNBjdry0HTIjQ8RJDaoGg5tTeZyR7J6uegyz9QYUYG3ZrxEpkKAHMqlbTrOX9L\nXVrj08Vy8rfTgjmHCuHavpAwH7ipLawdLaIOHxO6ftRodBjae10echCydWRD3QVS\ngKpl8RA20RTtT/bzU6vcRuuRKG4BT1YAuPjH4EFRAoGBANep6QMQrSFVtK/4Wvkd\n41HgZx/TONOrrpDTEkE2shYAYfUcpoyhsefbP6sDpNQ6n4KOZSWHU7JujlIy3fs8\nWMXa/NUVIIPdiIZXxpdS2swUkK4vHdSQAjMxkr7VY7L6obhtGinaCC6/HoYC6wlY\n16qJTCG05VMF1onqMNEvYCrw\n-----END PRIVATE KEY-----\n",
      client_email:
        "firebase-adminsdk-woas0@link-prod-3ecd0.iam.gserviceaccount.com",
      client_id: "104532869954227996418",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-woas0%40link-prod-3ecd0.iam.gserviceaccount.com"
    };
    // 파이어베이스
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    return admin.firestore();
  }
}

const _db: FirebaseFirestore.Firestore = Setting.setFirestore();

//크롤링
class GetUosHtml {
  db: FirebaseFirestore.Firestore;

  constructor(db: FirebaseFirestore.Firestore) {
    this.db = db;
  }
  static getNormalHtml(_db: FirebaseFirestore.Firestore, _urlId: string): void {
    var _title: string;
    var _url: string;
    var _department: string;
    var _post_date: number;
    var _desc: string | undefined;

    var notif: NotifModel;

    var titleList: Array<string> = [];
    var urlList: Array<string> = [];
    var depList: Array<string> = [];
    var dateList: Array<number> = [];
    var descList: Array<string | undefined> = [];

    try {
      Axios.get("https://www.uos.ac.kr/korNotice/list.do?list_id=" + _urlId)
        .then(html => {
          const $: CheerioStatic = cheerio.load(html.data, {
            decodeEntities: false
          });
          const $bodyList: Cheerio = $("ul.listType").children("li");
          $bodyList.each((i, elem) => {
            console.log(i);
            if ($(elem).attr("class") !== "on") {
              var titleIncludeNum: string = $(elem)
                .find("a")
                .text()
                .trim();

              //제목
              _title = titleIncludeNum.substring(5, titleIncludeNum.length);

              var jsValue: string | undefined = $(elem)
                .find("a")
                .attr("onclick");
              var _urlNum: string | undefined = jsValue?.split("'")[3];

              //주소(링크)
              _url =
                "https://www.uos.ac.kr/korNotice/view.do?list_id=" +
                _urlId +
                "&seq=" +
                _urlNum +
                "&epTicket=LOG";

              //날짜, 부서
              const $detail: Cheerio = $(elem).find("li");

              $detail.each((k, elem2) => {
                if (k === 0) {
                  //부서
                  _department = $(elem2).text();
                } else if (k === 1) {
                  var _date = $(elem2).text();
                  //날짜
                  _post_date = Number(
                    _date.substring(0, 4) +
                      _date.substring(5, 7) +
                      _date.substring(8, 10)
                  );
                }
              });
            }
            if (_title !== undefined && _url !== undefined) {
              //TODO : AXIOS 결과값 await로 처리해서 모델 안에 다 넣어서 return 하기

              titleList.push(_title);
              depList.push(_department);
              urlList.push(_url);
              dateList.push(_post_date);
              titleList.push(_title);

              Axios.get(_url)
                .then(html2 => {
                  const m = cheerio.load(html2.data, { decodeEntities: false });
                  const body = m("#contents > ul").children("li");
                  body.each((k, elem2) => {
                    if (k === body.length - 1) {
                      //내용
                      _desc = $(elem2)
                        .html()
                        ?.trim();
                      descList.push(_desc);

                      // if (_title !== undefined && _url !== undefined) {
                      //   //TODO : desc 안나오는 문제 해결 + 리스트에 목록 넘겨서 다음 then에서 데이터베이스로 저장
                      //   notif = {
                      //     title: _title,
                      //     url: _url,
                      //     department: _department,
                      //     post_date: _post_date,
                      //     desc: undefined
                      //   };
                      // }
                    }
                  });
                  var result: Array<NotifModel> = [];
                  for (var i = 0; i < titleList.length; i++) {
                    var notif: NotifModel = {
                      title: titleList[i],
                      department: depList[i],
                      post_date: dateList[i],
                      url: urlList[i],
                      desc: descList[i]
                    };
                    result.push(notif);
                  }
                  return result;
                })
                .catch(err =>
                  console.log("공지사항 내용을 가져오는데 에러 발생 : " + err)
                )
                .then(result => {
                  console.log(result);
                });
            }
          });

          return notif;
        })
        .catch(err => console.log("uos 페이지 접근 에러 : " + err));
    } catch (err) {
      console.log("uos 페이지 접근에서 에러 발생 : " + err);
    }
  }
  // static getStartUpHtml(_db: FirebaseFirestore.Firestore): void {}
}

//실행 부분
GetUosHtml.getNormalHtml(_db, "FA1");
