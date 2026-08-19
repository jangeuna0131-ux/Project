//제이쿼리 
$(function(){
//자바스크립트 코드나 제이쿼리 코드를 입력한다
// btn1버튼을 클릭하면 .parent안에 .box1숨김
$(".btn1").click(function(){

    // box1를 선택해서 숨겨라 
    $(".parent .box1").hide()
})

// show 버튼을 클릭하면 오렌지 박스를 보여라
$("#btn2").click(function(){
    $(".parent .box1").show()
})

// toggle버튼을 클릭하면 파랑색 박스를 숨김/보이기
$("#btn3").click(function(){
    $(".box2").toggle()
})


// big버튼을 클릭하면 box3을 크기를 두배로 400x400
$("#btn4").click(function(){
    $(".box3").width(400)
    $(".box3").height(400)
})



// small버튼을 클릭하면 box3의 크기를 200X200으로 설정

$("#btn5").click(function(){
        $(".box3").width(100)
        $(".box3").height(100)
    })

})