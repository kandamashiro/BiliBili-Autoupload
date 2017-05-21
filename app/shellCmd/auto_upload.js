/**
 * Created by XiaMi on 2017/5/14.
 */
var global = require('./global_variables');
var tool = require('../shellLib/tool');

var webpage = require('webpage');
var page = webpage.create();
var system = require('system');
var args = system.args;

var contributions = JSON.parse(args[1]);

console.log('aaa' + JSON.stringify(contributions));

phantom.exit();


const loggedCookie = tool.fileRead(global.LOGINED_COOKIE_JAR);

if (loggedCookie) {
  Array.prototype.forEach.call(loggedCookie, function(x) {
    phantom.addCookie(x);
  });
}

page.open(global.URL_SUBMIT, function(status) {
  if (status !== 'success') {
    console.error('自动上传开始失败!');
    phantom.exit();
  } else {
    console.log('自动上传开始');

    // var injectStatus = page.injectJs(page.libraryPath + global.DIR_JQUERY);
    //
    //
    // if (!injectStatus) {
    //   console.error('载入jquery失败');
    //   phantom.exit();
    // } else {
      //暂时限定同时最大上传数量为30个
      console.log('上传开始');

      page.uploadFile('.upload-wrp input[type=file]', page.libraryPath + '/../../test.flv');
      // page.uploadFile('.upload-wrp input[type=file]', page.libraryPath + '/../../test1.flv');

      //新建
      page.uploadFile('.cover-box input[type=file]', page.libraryPath + '/../../covers/cover.png');
      setTimeout(function () {
        page.evaluate(function () {
          $.fn.trigger2 = function(eventName) {
            return this.each(function() {
              var el = $(this).get(0);
              triggerNativeEvent(el, eventName);
            });
          };

          function triggerNativeEvent(el, eventName){
            if (el.fireEvent) { // < IE9
              (el.fireEvent('on' + eventName));
            } else {
              var evt = document.createEvent('Events');
              evt.initEvent(eventName, true, false);
              el.dispatchEvent(evt);
            }
          }

          $('.cover-wrp .btn-confirm').click();

          $('.title-wrp input[type=text]').val('2017年5月集合').trigger2('input');
          $('.description-wrp textarea').val('5月份的录播_(:з」∠)_').trigger2('input');
          $('.copyright-wrp input[name=copyright]').filter('[value=1]').click();

          var $menus = $('.type-menu .dropdown');

          //选择分区 生活-其他
          $menus.each(function(index, menuList) {
            var $menuList = $(menuList);
            if ($menuList.find('button').text().trim() === '生活') {
              $menuList.find('.menu-item').each(function(index, menu) {
                if ($(menu).find('.name').text().trim() === '其他') {
                  menu.click();
                }
              });
            }
          });

          setTimeout(function() {
            $('.bilibili-tag-wrp .row .highlight')[0].click();
          }, 300);
        });

        setTimeout(function() {

          page.evaluate(function() {

            $('.recommend-wrp input[type=text]').val('枯水').focus();
          });

          page.sendEvent('keypress', page.event.key.Enter);

          page.evaluate(function() {
            $('.recommend-wrp input[type=text]').val('录播').focus();
          });

          page.sendEvent('keypress', page.event.key.Enter);

          page.evaluate(function() {
            $('.office-tag-wrp .save-btn').click();
          });

        }, 1000);

      }, 700);

      //只显示上传进度部分
      setInterval(function () {
        var uploadObj = page.evaluate(function () {
          var $sortWrps = $('#sortWrp');
          var offset = $sortWrps.offset();
          var height = $sortWrps.height();
          var width = $sortWrps.width();

          return {
            top: offset.top,
            left: offset.left,
            height: height,
            width: width
          };
        });

        page.clipRect = uploadObj;
      }, 500);

      setInterval(function () {
        var results = page.evaluate(function () {
          var $sortWrps = $('#sortWrp');
          var $uploadInputs = $sortWrps.find('.status-wrp');

          return $uploadInputs.map(function () {
            return this.innerText;
          }).get().join('\r\n');
        });

        page.render('upload_monitor.png');
        console.log('out_data:MONITOR_UPDATE');
        console.log('上传进度：' + results);

        var uploadStatus = page.evaluate(function() {
          var uploadStatus = true;

          $('.upload-wrp .upload-status').map(function(index, status) {
            if ($(status).text().indexOf('上传完成') === -1) {
              uploadStatus = false;
            }
          });
          // if ()
          // $('.submit-wrp .submit-btn').click();

          return uploadStatus;
        });


        //全部上完后提交
        if (uploadStatus) {
          // page.evaluate(function() {
          //   $('.submit-wrp .submit-btn').click();
          // });
          // setTimeout(function () {
          //   console.log('上传文件完成');
          //   page.render('submit.png');
          //   phantom.exit();
          // }, 5000);
        }

      }, 500);
    // }
  }
});
