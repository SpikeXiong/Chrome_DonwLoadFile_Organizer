import { rulesMgr, downloadRule } from '../scripts/modules.js';

const id_urlEdt = 'UrlEdt_';
const id_extEdt = 'extEdt_';
const id_fileNameEdt = 'fileNameEdt_';
const id_downloadEdt = 'downloadEdt_';
const id_enabledLbl = 'enabledLbl_';
const id_enabledChk = 'enabledChk_';
const id_delBtn = 'delBtn_';

const ruleMgr = new rulesMgr();

//刷新规则列表
const updateList = async () => {  
  const ruleList = await ruleMgr.getAllRules();
  var list = document.getElementById('list');
  list.innerHTML = '';//清空list
  if(ruleList.length > 0){
    ruleList.forEach(
      element => {      
        AddOneRuleInput(element);
        Object.entries(element).forEach(([key, value]) => {
          //console.log(`${key}: ${value}`);
        });      
    });   
  };  
  return ruleList;
}

//根据Element Id获取Rule
async function getRuleByElemId(id){
  var targetId = id;
  var id = targetId.split('_')[1];  
  console.log(`getRuleByElemId id ${id}`);
  var rule = await ruleMgr.getRuleById(id);
    Object.entries(rule).forEach(([key, value]) => {
     console.log(`${key}: ${value}`);
    });  
  return rule;
}

//获取最近修改编辑库指定的rule
function getViewRuleByElemId(id){
  var targetId = id;
  var id = targetId.split('_')[1];
  var url = document.getElementById(`${id_urlEdt}${id}`).value;
  var enabled = document.getElementById(`${id_enabledChk}${id}`).checked;
  var ext = document.getElementById(`${id_extEdt}${id}`).value;
  var fileName = document.getElementById(`${id_fileNameEdt}${id}`).value;
  var downloadPath = document.getElementById(`${id_downloadEdt}${id}`).value;
  var rule = new downloadRule(id, downloadPath, enabled, url, ext, fileName);
  return rule;
}

//删除规则
const delRule = async (event) =>{
  console.log('delRule');
  var rule = await getRuleByElemId(event.target.id);
  await ruleMgr.delRule(rule);
  updateList();
}

//修改规则
const setRule = async (event) =>{
  console.log('setRule');
  var rule = getViewRuleByElemId(event.target.id);
  Object.entries(rule).forEach(([key, value]) => {
    console.log(`${key}: ${value}`)});
  await ruleMgr.setRule(rule);
  updateList();
}

//动态添加一行控件  
function AddOneRuleInput(downloadRule){
  
  var newDiv = document.createElement('div');

  //enable 勾选框
  var enabledLbl = document.createElement('label');
  enabledLbl.className = 'checkboxtitle';
  enabledLbl.id = `${id_enabledLbl}${downloadRule.id}`;
  var enabledChk = document.createElement('input');
  enabledChk.type = 'checkbox';
  enabledChk.className = 'checkboxtitle';
  enabledChk.checked = downloadRule.enabled;
  enabledChk.id = `${id_enabledChk}${downloadRule.id}`;
  enabledChk.addEventListener("change", function(event){setRule(event)});
  //添加进label元素
  enabledLbl.appendChild(enabledChk);

  //Url 编辑框
  var url = document.createElement('input');
  url.placeholder = 'Url';
  url.type = 'text';
  url.id = `${id_urlEdt}${downloadRule.id}`;
  url.value = downloadRule.url;
  url.addEventListener("focusout", function(event){setRule(event)});

  //Extension 编辑框
  var ext = document.createElement('input');
  ext.placeholder = 'Ext like ".zip|.exe|.png"';
  ext.type = 'text';
  ext.id = `${id_extEdt}${downloadRule.id}`;
  ext.value = downloadRule.ext;
  ext.addEventListener("focusout", function(event){setRule(event)});

  //File Name 编辑框
  var fileName = document.createElement('input');
  fileName.placeholder = 'FileName';
  fileName.value = downloadRule.fileName;
  fileName.type = 'text';
  fileName.id = `${id_fileNameEdt}${downloadRule.id}`;
  fileName.addEventListener("focusout", function(event){setRule(event)});

  //DownLoad Path 编辑框
  var downLoad = document.createElement('input');
  downLoad.placeholder = 'Path like "GitHub/zip"';
  downLoad.type = 'text';
  downLoad.id = `${id_downloadEdt}${downloadRule.id}`;
  downLoad.value = downloadRule.savePath;
  downLoad.addEventListener("focusout", function(event){setRule(event)});


  //删除按钮
  var del = document.createElement('button');
  del.id = `${id_delBtn}${downloadRule.id}`;
  del.textContent = 'del';
  del.className='';
  del.addEventListener('click', function(event){ delRule(event) });

  newDiv.appendChild(enabledLbl);
  newDiv.appendChild(url);
  newDiv.appendChild(ext);
  newDiv.appendChild(fileName);
  newDiv.appendChild(downLoad);
  newDiv.appendChild(del);

  var listform = document.getElementById('list');
  listform.appendChild(newDiv);
}  

//添加规则
const addRule = async () =>{
  console.log("saveFilterOption");
  const savePath = "";
  const url = "";
  const ext = "";
  const fileName = ""
  const enabled = true;
  const filter = new downloadRule(1, savePath, enabled, url, ext, fileName);
  //for (let index = 0; index < 10000; index++) {      
  await ruleMgr.addRules(filter); 
  //}

  //刷新列表
  updateList();
}

// Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
const restoreOptions = () => {
  console.log("restoreOptions");
  updateList();
};

const clearData = async () => {
  await ruleMgr.clearAllRules();
  updateList()
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('addData').addEventListener('click', addRule);
//document.getElementById('clearData').addEventListener('click', clearData);

