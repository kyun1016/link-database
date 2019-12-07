const axios = require("axios");
const cheerio = require("cheerio");
const voca = require("voca");
const log = console.log;
const admin = require('firebase-admin');

//이 부분은 aws에 적용할 때 json파일을 집어넣지 않아도 사용되도록 선언을 해주었습니다.
var serviceAccount = {
      //개인 키를 넣어주면 됩니다.
    };


// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let db = admin.firestore();

const getHtml = async function(url) {
  try {
    // return await axios.get("https://www.uos.ac.kr/korNotice/list.do?list_id=FA1");
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
};
//li id = "view_content"

const getHtml_deep = async function(url) {
  try {
    // return await axios.get("https://www.uos.ac.kr/korNotice/list.do?list_id=FA1");
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
};


//위에 선언한 함수를 실행한다. 이때, 주소는 FA1의 일반공지를 파싱한다
getHtml("https://www.uos.ac.kr/korNotice/list.do?list_id=FA1")
  .then(html => {
    const $ = cheerio.load(html.data);
    //공지의 li부분을 $bodyList에 담아준다.
    const $bodyList = $("ul.listType").children("li");
    //li크기만큼 반복을 시행한다.
    $bodyList.each(function(i, elem) {
      //만일 이 함수의 class가 on이 아니라면 위에 배너 공지가 아니므로 크롤링을 수행한다.
      if($(elem).attr('class') != 'on'){
        //title 부분을 가져와서 가공한다.
        var title =  $(elem).find('a').text()
        title = voca.replaceAll(title, "\t", '')
        title = voca.replaceAll(title, "\r\n", '')
        title = voca.trim(title)
        title = title.substring(5, title.length);
        //url은 a태그의 onclick을 보면 알 수 있다.
        var url = $(elem).find('a').attr('onclick')

        url = url.substring(8, url.length - 3);

        //문자열을 '에서 나눠준다.
        var post_url = url.split("'");
        var uid = post_url[2];

        url = "https://www.uos.ac.kr/korNotice/view.do?list_id=FA1&seq=" + uid;

        //추가적으로 공지사항 날짜, 부서를 가져오자.
        const $detail = $(elem).find("li");

        var department;
        var post_date;

        $detail.each(function(k, elem2) {
          if(k == 0)
            department = $(elem2).text();
          else if(k==1)
            post_date = $(elem2).text();
        });

        post_date = post_date.substring(0,4) + post_date.substring(5,7) + post_date.substring(8,10)
        post_date = Number(post_date);

        getHtml_deep(url).then(html2 => {
          const m = cheerio.load(html2.data);
          // log(m.length)
          // log(m.html());
          const body = m("ul.listType").children("li");

          var detail;
          var l = body.length
          body.each(function(k, elem2) {
            if(k==l-1)
              detail = $(elem2).html();
          });

          var docRef = db.collection('공지사항').doc(uid);
          docRef.set({
              "uid": uid,
              title: title,
              department: department,
              type: "일반 공지",
              post_date: post_date,
              detailurl: url,
              detail_content: detail
          })
        })
      }
    });
  })




  //위에 선언한 함수를 실행한다. 이때, 주소는 FA1의 일반공지를 파싱한다
  getHtml("https://www.uos.ac.kr/korNotice/list.do?list_id=FA2")
    .then(html => {
      const $ = cheerio.load(html.data);
      //공지의 li부분을 $bodyList에 담아준다.
      const $bodyList = $("ul.listType").children("li");
      //li크기만큼 반복을 시행한다.
      $bodyList.each(function(i, elem) {
        //만일 이 함수의 class가 on이 아니라면 위에 배너 공지가 아니므로 크롤링을 수행한다.
        if($(elem).attr('class') != 'on'){
          //title 부분을 가져와서 가공한다.
          var title =  $(elem).find('a').text()
          title = voca.replaceAll(title, "\t", '')
          title = voca.replaceAll(title, "\r\n", '')
          title = voca.trim(title)
          title = title.substring(4, title.length);
          //url은 a태그의 onclick을 보면 알 수 있다.
          var url = $(elem).find('a').attr('onclick')

          url = url.substring(8, url.length - 3);

          //문자열을 '에서 나눠준다.
          var post_url = url.split("'");
          var uid = post_url[2];

          url = "https://www.uos.ac.kr/korNotice/view.do?list_id=FA2&seq=" + uid;

          //추가적으로 공지사항 날짜, 부서를 가져오자.
          const $detail = $(elem).find("li");

          var department;
          var post_date;

          $detail.each(function(k, elem2) {
            if(k == 0)
              department = $(elem2).text();
            else if(k==1)
              post_date = $(elem2).text();
          });

          post_date = post_date.substring(0,4) + post_date.substring(5,7) + post_date.substring(8,10)
          post_date = Number(post_date);

          getHtml_deep(url).then(html2 => {
            const m = cheerio.load(html2.data);
            const body = m("ul.listType").children("li");

            var detail;
            var l = body.length
            body.each(function(k, elem2) {
              if(k== l -1)
                detail = $(elem2).html();
            });
            var docRef = db.collection('공지사항').doc(uid);
            docRef.set({
                uid: uid,
                title: title,
                department: department,
                type: "학사 공지",
                post_date: post_date,
                detailurl: url,
                detail_content: detail
            })
          })
        }
      });
    })


    //위에 선언한 함수를 실행한다. 이때, 주소는 FA1의 일반공지를 파싱한다
    getHtml("https://www.uos.ac.kr/korNotice/list.do?list_id=FA34")
      .then(html => {
        const $ = cheerio.load(html.data);
        //공지의 li부분을 $bodyList에 담아준다.
        const $bodyList = $("ul.listType").children("li");
        //li크기만큼 반복을 시행한다.
        $bodyList.each(function(i, elem) {
          //만일 이 함수의 class가 on이 아니라면 위에 배너 공지가 아니므로 크롤링을 수행한다.
          if($(elem).attr('class') != 'on'){
            //title 부분을 가져와서 가공한다.
            var title =  $(elem).find('a').text()
            title = voca.replaceAll(title, "\t", '')
            title = voca.replaceAll(title, "\r\n", '')
            title = voca.trim(title)
            title = title.substring(4, title.length);
            //url은 a태그의 onclick을 보면 알 수 있다.
            var url = $(elem).find('a').attr('onclick')

            url = url.substring(8, url.length - 3);

            //문자열을 '에서 나눠준다.
            var post_url = url.split("'");
            var uid = post_url[2];

            url = "https://www.uos.ac.kr/korNotice/view.do?list_id=FA34&seq=" + uid;

            //추가적으로 공지사항 날짜, 부서를 가져오자.
            const $detail = $(elem).find("li");

            var department;
            var post_date;

            $detail.each(function(k, elem2) {
              if(k == 0)
                department = $(elem2).text();
              else if(k==1)
                post_date = $(elem2).text();
            });

            post_date = post_date.substring(0,4) + post_date.substring(5,7) + post_date.substring(8,10)
            post_date = Number(post_date);

            getHtml_deep(url).then(html2 => {
              const m = cheerio.load(html2.data);
              // log(m.length)
              // log(m.html());
              const body = m("ul.listType").children("li");

              var detail;

              var l = body.length

              body.each(function(k, elem2) {
                if(k==l-1)
                  detail = $(elem2).html();
              });

              var docRef = db.collection('공지사항').doc(uid);
              docRef.set({
                  uid: uid,
                  title: title,
                  department: department,
                  type: "직원채용",
                  post_date: post_date,
                  detailurl: url,
                  detail_content: detail
              })
            })
          }
        });
      })



  //위에 선언한 함수를 실행한다. 이때, 주소는 FA35의 창업공지를 파싱한다
  getHtml("https://www.uos.ac.kr/korNotice/list.do?list_id=FA35")
    .then(html => {
      const $ = cheerio.load(html.data);
      //공지의 li부분을 $bodyList에 담아준다.
      const $bodyList = $("ul.listType").children("li");
      //li크기만큼 반복을 시행한다.
      $bodyList.each(function(i, elem) {
        //만일 이 함수의 class가 on이 아니라면 위에 배너 공지가 아니므로 크롤링을 수행한다.
        if($(elem).attr('class') != 'on'){
          //title 부분을 가져와서 가공한다.
          var title =  $(elem).find('a').text()
          title = voca.replaceAll(title, "\t", '')
          title = voca.replaceAll(title, "\r\n", '')
          title = voca.trim(title)
          //url은 a태그의 onclick을 보면 알 수 있다.
          var url = $(elem).find('a').attr('onclick')

          url = url.substring(8, url.length - 3);

          //문자열을 '에서 나눠준다.
          var post_url = url.split("'");
          var uid = post_url[2];

          url = "https://www.uos.ac.kr/korNotice/view.do?list_id=FA35&seq=" + uid;

          //추가적으로 공지사항 날짜, 부서를 가져오자.
          const $detail = $(elem).find("li");

          var department = "창업지원단";
          var post_date;

          $detail.each(function(k, elem2) {
            if($(elem2).text().length == 10)
              post_date = $(elem2).text();
          });

          post_date = post_date.substring(0,4) + post_date.substring(5,7) + post_date.substring(8,10)
          post_date = Number(post_date);

          title = title.substring(3, title.length);

          getHtml_deep(url).then(html2 => {
            const m = cheerio.load(html2.data);
            // log(m.length)
            // log(m.html());
            const body = m("ul.listType").children("li");

            var detail;
            var l = body.length


            body.each(function(k, elem2) {
              if(k==l-1)
                detail = $(elem2).html();
            });

            var docRef = db.collection('공지사항').doc(uid);
            docRef.set({
                uid: uid,
                title: title,
                department: department,
                type: "창업 공지",
                post_date: post_date,
                detailurl: url,
                detail_content: detail
            })
          })
        }
      });
    })
