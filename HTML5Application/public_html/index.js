
var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";
var jpdbIML = "/api/iml";
var empDBName = "EMP-REL";
var empRelationName = "Employee";
var connToken = "90931747|-31949311072233648|90963359";

$('#empId').focus();

setBaseUrl(jpdbBaseURL);

function disableCtrl(ctrl) {
    $('#new').prop('disabled', ctrl);
    $("#change").prop("disabled", ctrl);
    $("#reset").prop("disabled", ctrl);
    $("#empSave").prop("disabled", ctrl);
    $("#edit").prop("disabled", ctrl);
}

function disableNav(ctrl) {
    $('#next').prop('disabled', ctrl);
    $("#prev").prop("disabled", ctrl);
    $("#first").prop("disabled", ctrl);
    $("#last").prop("disabled", ctrl);
}

function disableForm(ctrl) {
    $('#empId').prop('disabled', ctrl);
    $("#empName").prop("disabled", ctrl);
    $("#hra").prop("disabled", ctrl);
    $("#da").prop("disabled", ctrl);
    $("#deductions").prop("disabled", ctrl);
    $('#basic_salary').prop('disabled', ctrl);
}

function initEmpForm() {
    localStorage.removeItem('first_rec_no');
    localStorage.removeItem('last_rec_no');
    localStorage.removeItem('rec_no');

    console.log("initEmpForm is done");
}

function validateAndGetFormData() {
    var empIdVar = $("#empId").val();
    if (empIdVar === "") {
        alert("Employee ID Required Value");
        $("#empId").focus();
        return "";
    }
    var empNameVar = $("#empName").val();
    if (empNameVar === "") {
        alert("Employee Name is Required Value");
        $("#empName").focus();
        return "";
    }
    var basicSalVar = $("#basic_salary").val();
    if (basicSalVar === "") {
        alert("Employee basic_salary is Required Value");
        $("#basic_salary").focus();
        return "";
    }

    var hraVar = $("#hra").val();
    if (hraVar === "") {
        alert("Employee HRA is Required Value");
        $("#hra").focus();
        return "";
    }

    var daVar = $("#da").val();
    if (daVar === "") {
        alert("Employee DA is Required Value");
        $("#da").focus();
        return "";
    }

    var deductionsVar = $("#deductions").val();
    if (deductionsVar === "") {
        alert("Employee deductions is Required Value");
        $("#deductions").focus();
        return "";
    }

    var jsonStrObj = {
        empId: empIdVar,
        empName: empNameVar,
        empSal: basicSalVar,
        emphra: hraVar,
        empda: daVar,
        empdeductions: deductionsVar
    }
    return JSON.stringify(jsonStrObj);
}

function emptyform() {
    $("#empId").val("")
    $("#empName").val("");
    $("#basic_salary").val("");
    $("#hra").val("");
    $("#da").val("");
    $("#deductions").val("");
}
function resetForm() {
    disableCtrl(true);
    disableNav(false);
    
    var getCurRequest=createGET_BY_RECORDRequest(connToken,empRelationName,empDBName,getCurrRecNoFromLS());
    jQuery.ajaxSetup({async:false});
    var result=executeCommand(getCurRequest,jpdbIRL);
    showData(result);
    jQuery.ajaxSetup({async:true});
    
    if(isOnlyOneRecordPresent() || isNoRecordPresentLS()){
        disableNav(true);
    }
    
    $("#new").prop("disabled",false);
    if(isNoRecordPresentLS()){
        makeDataFormEmpty();
        $("#edit").prop("disabled",true);
    }
    else{
        $("#edit").prop("disabled",false);
    }
    disableForm(true);
}


function saveEmployee() {
    var jsonStr = validateAndGetFormData();
    if (jsonStr === "") {
        return;
    }
    var putReqStr = createPUTRequest(connToken,
            jsonStr, empRelationName, empDBName);
    alert(putReqStr);
    jQuery.ajaxSetup({async: false});
    var resultObj = executeCommandAtGivenBaseUrl(putReqStr,
            jpdbBaseURL, jpdbIML);
//    alert(JSON.stringify(resultObj));
    jQuery.ajaxSetup({async: true});
    if (isNoRecordPresentLS(resultObj)) {
        setFirstRecNo2LS(resultObj);
    }
    setLastRecNo2LS(resultObj);
    setCurrRecNo2LS(resultObj);
    resetForm();
}

//function ChangeData() {
//    $("change").prop("disabled", true);
//    jsonChg = validateAndGetFormData();
//    console.log(jsonChg);
//    console.log(localStorage.getItem('recno'));
//    var updateRequest = createUPDATERecordRequest(connToken, jsonChg, empRelationName, empDBName, localStorage.getItem('recno'));
//    // alert(updateRequest);
//    jQuery.ajaxSetup({async: false});
//    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
//    jQuery.ajaxSetup({async: true});
//    alert(JSON.stringify(resJsonObj));
//    // alert("Data Updated Successfully");
//    // console.log(resJsonObj);
//    resetForm();
//}



function getEmpId() {
    var empid = $('#empId').val();
    var jsonStr = {
        empId: empid
    }
    $("#reset").prop("disabled", false);
    $("#empSave").prop("disabled", false);
    return JSON.stringify(jsonStr);
}

function getEmp() {
    var empidObj = getEmpId();
    console.log(empidObj);
    var getReq = createGET_BY_KEYRequest(connToken, empRelationName, empDBName, empidObj);
    console.log(getReq);
    jQuery.ajaxSetup({async: false});
    var resJsonObj = executeCommandAtGivenBaseUrl(getReq, jpdbBaseURL, jpdbIRL);
    console.log(resJsonObj);
    jQuery.ajaxSetup({async: true});

    if (resJsonObj.status === 400) {

        $("#change").prop("disabled,", true);
        $("#reset").prop("disabled", false);
        $("#empSave").prop("disabled,", false);
        $('#empName').focus();
    } else if (resJsonObj.status === 200) {
        showData(resJsonObj);
        $("#empSave").prop("disabled,", true);
    }
}

function fillData(jsonObj) {
    saveRecNo2LS(jsonObj);
    var rec = JSON.parse(jsonObj.data).record;
//    console.log(rec);
    $('#empName').val(rec.empName);
    $('#basic_salary').val(rec.empSal);
    $('#hra').val(rec.emphra);
    $('#da').val(rec.empda);
    $('#deductions').val(rec.empdeductions);
}

function setFirstRecNo2LS(jsonObj){
    var data=JSON.parse(jsonObj.data);
    if(data.rec_no===undefined){
        localStorage.setItem("first_rec_no","0");
    }
    else{
        localStorage.setItem("first_rec_no",data.rec_no);
    }
}

function getFirstRecNoFromLS(){
    return localStorage.getItem("first_rec_no");
}

function setLastRecNo2LS(jsonObj){
    var data=JSON.parse(jsonObj.data);
    if(data.rec_no===undefined){
        localStorage.setItem("last_rec_no","0");
    }
    else{
        localStorage.setItem("last_rec_no",data.rec_no);
    }
}

function setCurrRecNo2LS(jsonObj){
    var data=JSON.parse(jsonObj.data);
    if(data.rec_no===undefined){
        localStorage.setItem("rec_no","0");
    }
    else{
        localStorage.setItem("rec_no",data.rec_no);
    }
}

function getLastRecNoFromLS(){
    return localStorage.getItem("last_rec_no");
}

function getCurrRecNoFromLS(){
    return localStorage.getItem("rec_no");
}


function newEmployee() {
    emptyform();

    disableForm(false);
    $("#empId").focus();
    disableNav(true);
    disableCtrl(true);

    $("#empSave").prop("disabled", false);
    $("#reset").prop("disabled", false);
    
    return;
}

function saveRecNo2LS(jsonObj) {
    var lyData = JSON.parse(jsonObj.data);
    localStorage.setItem('recno', lyData.rec_no);
}

function showData(jsonObj) {
    if (jsonObj.status === 400) {
        return;
    }
    console.log(jsonObj);
    var data = (JSON.parse(jsonObj.data)).record;
    setCurrRecNo2LS(jsonObj);
    
    $('#empId').val(data.empId);
    $('#empName').val(data.empName);
    $('#basic_salary').val(data.empSal);
    $('#hra').val(data.emphra);
    $('#da').val(data.empda);
    $('#deductions').val(data.empdeductions);

    disableNav(false);
    disableForm(true);

    $("#empSave").prop("disabled", true);
    $("#change").prop("disabled", true);
    $("#reset").prop("disabled", true);
    $("#new").prop("disabled", false);
    $("#edit").prop("disabled", false);

    if (getCurrRecNoFromLS() === getLastRecNoFromLS()) {
        $('#next').prop('disabled', true);
        $('#last').prop("disabled", true);
    }
//    else if (getCurrRecNoFromLS() === getFirstRecNoFromLS()) {
//        $('#prev').prop('disabled', true);
//        $('#first').prop("disabled", true);
//    }
    return;

}

function editData(){
    disableForm(false);
    $("#empId").prop("disabled",true);
    $("#empName").focus();
    
    disableNav(true);
    disableCtrl(true);
    $("#change").prop("disabled",false);
    $("#reset").prop("disabled",false);
}

function ChangeData(){
    jsonChg=validateAndGetFormData();
    var updateRequest= createUPDATERecordRequest(connToken,jsonChg, empRelationName,empDBName,getCurrRecNoFromLS());
    jQuery.ajaxSetup({async:false});
    var jsonObj=executeCommandAtGivenBaseUrl(updateRequest,jpdbBaseURL,jpdbIML);
    jQuery.ajaxSetup({async:true});
    console.log(jsonObj);
    resetForm();
}

function getFirst() {
    var getFirstRequest = createFIRST_RECORDRequest(connToken, empRelationName, empDBName);
//    alert(getFirstRequest);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getFirstRequest, jpdbIRL);
    showData(result);
    setFirstRecNo2LS(result);
    jQuery.ajaxSetup({async: true});
    $("#empId").prop("disabled", true);
    $("#first").prop("disabled", true);
    $("#prev").prop("disabled", true);
    $("#next").prop("disabled", false);
    $("#last").prop("disabled", false);
    $("#save").prop("disabled", true);
    return;
}

function getLast() {
    var getLastRequest = createLAST_RECORDRequest(connToken, empRelationName, empDBName);
    jQuery.ajaxSetup({async: false});
    var result = executeCommand(getLastRequest, jpdbIRL);
    showData(result);
    setLastRecNo2LS(result);
    jQuery.ajaxSetup({async: true});
    $("#empId").prop("disabled", true);
    $("#first").prop("disabled", false);
    $("#prev").prop("disabled", false);
    $("#next").prop("disabled", true);
    $("#last").prop("disabled", true);
    $("#save").prop("disabled", true);
    return;
}

function getPrev(){
    var r=getCurrRecNoFromLS();
    if(r==1){
        $("#prev").prop("disabled",true);
        $("#first").prop("disabled",true);
    }
    var getPrevRequest=createPREV_RECORDRequest(connToken,empRelationName,empDBName,r);
    jQuery.ajaxSetup({async: false});
    var result=executeCommand(getPrevRequest,jpdbIRL);
    showData(result);
    jQuery.ajaxSetup({async: true});
    var r=getCurrRecNoFromLS();
    console.log(r);
    if(r==1){
        $("#first").prop("disabled",true);
        $("#prev").prop("disabled",true);
    }
    $("#save").prop("disabled",true);
    return;
}

function getNext(){
    var r=getCurrRecNoFromLS();
    
    var getNextRequest=createNEXT_RECORDRequest(connToken,empRelationName,empDBName,r);
    
    jQuery.ajaxSetup({async: false});
    var result=executeCommand(getNextRequest,jpdbIRL);
    showData(result);
    jQuery.ajaxSetup({async: true});
    
    $("#save").prop("disabled",true);
    
    return;
}


function isNoRecordPresentLS() {
    if (getFirstRecNoFromLS() === '0' ) {
        return true;
    }
    return false;
}

function isOnlyOneRecordPresent() {
    if (isNoRecordPresentLS()) {
        return false;
    }
    if (getFirstRecNoFromLS() === getLastRecNoFromLS()) {
        return true;
    }
    return false;
}

function checkForNoOrOneRecord() {
    console.log(getFirstRecNoFromLS());
//    console.log(getLastRecNoFromLS());
    if (isNoRecordPresentLS()) {
        console.log("NO rec")
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled", false);
    }
    if (isOnlyOneRecordPresent()) {
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled", false);
        $("#edit").prop("disabled", false);
    }
    console.log("check for no or one record done");
    return;
}

initEmpForm();
getFirst();
checkForNoOrOneRecord();