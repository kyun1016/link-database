"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
var cheerio = require("cheerio");
var admin = require("firebase-admin");
//파이어베이스 세팅
var Setting = /** @class */ (function() {
  function Setting() {}
  Setting.setFirestore = function() {
    //파이어베이스 연동 정보
    var serviceAccount = {
////비밀정보
    };
    // 파이어베이스
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    return admin.firestore();
  };
  return Setting;
}());
var _db = Setting.setFirestore();
//크롤링
var GetUosHtml = /** @class */ (function() {
  function GetUosHtml(db) {
    this.db = db;
  }
  GetUosHtml.getNormalHtml = function(_db, _urlId) {
    var _title;
    var _url;
    var _department;
    var _post_date;
    var _desc;
    var notif;
    var titleList = [];
    var urlList = [];
    var depList = [];
    var dateList = [];
    var descList = [];
    try {
      axios_1["default"].get("https://www.uos.ac.kr/korNotice/list.do?list_id=" + _urlId)
        .then(function(html) {
          var $ = cheerio.load(html.data, {
            decodeEntities: false
          });
          var $bodyList = $("ul.listType").children("li");
          $bodyList.each(function(i, elem) {
            var _a;
            console.log(i);
            if ($(elem).attr("class") !== "on") {
              var titleIncludeNum = $(elem)
                .find("a")
                .text()
                .trim();
              //제목
              _title = titleIncludeNum.substring(3, titleIncludeNum.length);
              var jsValue = $(elem)
                .find("a")
                .attr("onclick");
              var _urlNum = (_a = jsValue) === null || _a === void 0 ? void 0 : _a.split("'")[3];
              //주소(링크)
              _url =
                "https://www.uos.ac.kr/korNotice/view.do?list_id=" +
                _urlId +
                "&seq=" +
                _urlNum +
                "&epTicket=LOG";
              //날짜, 부서
              var $detail = $(elem).find("li");
              $detail.each(function(k, elem2) {
                if (k === 0) {
                  //부서
                  _department = $(elem2).text();
                } else if (k === 1) {
                  var _date = $(elem2).text();
                  //날짜
                  _post_date = Number(_date.substring(0, 4) +
                    _date.substring(5, 7) +
                    _date.substring(8, 10));
                }
              });
            }
            if (_title !== undefined && _url !== undefined) {
              //TODO : AXIOS 결과값 await로 처리해서 모델 안에 다 넣어서 return 하기
              titleList.push(_title);
              depList.push(_department);
              urlList.push(_url);
              dateList.push(_post_date);
              axios_1["default"].get(_url)
                .then(function(html2) {
                  var m = cheerio.load(html2.data, {
                    decodeEntities: false
                  });
                  var body = m("#contents > ul").children("li");
                  body.each(function(k, elem2) {
                    var _a;
                    if (k === body.length - 1) {
                      //내용
                      _desc = (_a = $(elem2)
                        .html()) === null || _a === void 0 ? void 0 : _a.trim();
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
                  var result = [];
                  if(descList.length == titleList.length){
                    for (var i = 0; i < titleList.length; i++) {
                      if(i != 0){
                        if(dateList[i] != dateList[i-1])
                          break;
                      }
                      var notif = {
                        title: titleList[i],
                        department: "창업지원단",
                        post_date: dateList[i],
                        url: urlList[i],
                        desc: descList[i]
                      };
                      result.push(notif);
                    }
                  }
                  return result;
                })["catch"](function(err) {
                  return console.log("공지사항 내용을 가져오는데 에러 발생 : " + err);
                })
                .then(function(result) {
                  // console.log("hi");
                  console.log(result);
                });
            }
          });

          return notif;
        })["catch"](function(err) {
          return console.log("uos 페이지 접근 에러 : " + err);
        });
    } catch (err) {
      console.log("uos 페이지 접근에서 에러 발생 : " + err);
    }
  };
  return GetUosHtml;
}());
//실행 부분
console.log(GetUosHtml.getNormalHtml(_db, "FA35"))
