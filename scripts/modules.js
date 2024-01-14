//定义过滤器的数据结构
export class downloadRule{
    constructor(id, savePath, enabled, url, ext, fileName){
        this.id = id;
        this.fileName = fileName;
        this.savePath = savePath;
        this.enabled = enabled;        
        this.url = url;
        this.ext = ext;
    }    
}

//Rules管理对象，用于对Rules增删改查
export class rulesMgr{

    //添加一条新的规则
    async addRules(downloadRule){
        try {
            console.log('addRules');
            //获取当前所有的Rules
            var ruleList = await this.getAllRules();
            console.log(`ruleList type is ${typeof ruleList}`);            
            console.log(`downloadRule.id ${downloadRule.id}  ${typeof downloadRule.id}`);
            if(ruleList.length > 0){
                const existingIds = new Set(ruleList.map((rule) => {
                    //保证ID唯一
                    console.log(`rule.id ${rule.id}  ${typeof rule.id}`);
                    return rule.id;
                }));
                while (existingIds.has(downloadRule.id)) {
                    downloadRule.id++;
                }
            }else{
                ruleList = [];     
            }
            //添加rule
            ruleList.push(downloadRule);
            this.setAllRules(ruleList);
            console.log('Rule added successfully:', downloadRule);

        } catch (error) {
            console.error('Error adding rule:', error);   
        }finally{
            console.log('addRules end');
        }
    }
   
    //替换一条记录
    async setRule(downloadRule){
        try {
            //获取当前所有的Rules
            var ruleList = await this.getAllRules();       
            console.log(`downloadRule id ${downloadRule.id}`);
            //移除原有的rule
            console.log(`rulelist count ${ruleList.length}`);
            var ruleList_ = ruleList.filter((rule) => 
                {                    
                    console.log(`rule id ${rule.id}`);
                    console.log(`downloadRule id ${downloadRule.id}`);
                    console.log(`result ${rule.id !== downloadRule.id}`);

                    return rule.id != downloadRule.id;
                });
            console.log(`ruleList_ count ${ruleList_.length}`);
            //添加新的
            ruleList_.push(downloadRule);
            this.setAllRules(ruleList_);
        } catch (error) {
            console.error(`setRule ${error}`);
        } finally{
            console.log(`setRule end`);
        }
    }

    //移除一条记录
    async delRule(downloadRule){
      try {
           //获取当前所有的Rules
           var ruleList = await this.getAllRules();      
           console.log(`downloadRule id ${downloadRule.id}`);

           //移除原有的rule
           ruleList = ruleList.filter((rule) => rule.id != downloadRule.id);
           console.log(`rulelist count ${ruleList.length}`);
           //添加新的
           this.setAllRules(ruleList);
        } catch (error) {
            console.error(`setRule ${error}`);
        }    
    }

    //通过id获取rule 注意，chrome.stroage所有操作都是异步的
    async getRuleById(id){
        const rulelist = await this.getAllRules();
        return rulelist.find(rule => rule.id == id);        
    }

    //获取所有的Rules - 注意，chrome.stroage所有操作都是异步的，这里使用Promise的方式处理
    async getAllRules(){
        
        return new Promise((resolve) => {
            chrome.storage.sync.get({ Rules: [] }, (items) => {
              var rules = items.Rules || [];              
              console.log(`rules type is ${typeof rules}`);
              if (rules.length > 0) {
                
                // 将id属性转换为整数类型
                rules.forEach(rule => {                  
                    rule.id = parseInt(rule.id, 10);
                  });
                //按照id排序
                rules.sort((a, b) => a.id - b.id);
              }             
              resolve(rules);
            });
          });
    }

    //清空规则
    async clearAllRules(){
       await this.setAllRules([]);    
    }

    //整体刷新所有Rules
    //todo： 后续做成单条添加的方法
    setAllRules(rules){
        chrome.storage.sync.set({Rules: rules}, () => { })
    }

    //获取启用的规则
    async getEnabledRules(){
        console.log('getEnabledRules');
        const rules = await this.getAllRules(); 
        console.log(`rules count ${rules.length}`);
        const enabledRules = rules.filter((rule) => rule.enabled);
        return enabledRules;  
    }
}

//下载路径管理对象
export class downLoadFileMgr{

    constructor(url, fileName)
    {
        this.url = url;
        this.fileName = fileName;
        this.saveName = fileName;
        this.ruleMgr = new rulesMgr();
    }
    
    //获取文件后缀
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }

    //获取匹配的规则
    getMatchRule(ruleList){
        console.log('getMatchRule');
        try {       
                var result = [];     
                if(ruleList && Array.isArray(ruleList))
                {
                    result = ruleList.filter((rule) =>{
                        var result = false;
                        const urlMatched = this._urlMatched(rule.url);
                        const extMatched = this._extensionMatched(rule.ext);
                        const fileNameMatched = this._fileNameMatched(rule.fileName);
                        result = urlMatched && extMatched && fileNameMatched;
                        return result;
                    });
                }else{
                    console.log('ruleList not Array');
                }                
                return result;
        } catch (error) {
            console.error(error);
        }finally{
            console.log('getMatchRule End');
        }

    }

    //获取保存的路径
    async getSaveFileNameAsync(){
        console.log('getSaveFileName');
        const ruleList = await this.ruleMgr.getEnabledRules(); 
        var saveName = this.saveName;
        if(ruleList.length > 0){
            console.log('ruleList.length > 0');
            const matchedRules = this.getMatchRule(ruleList);
            if(matchedRules.length > 0)
            {
                saveName = matchedRules[0].savePath + '/' + this.fileName; 
                this.saveName = saveName;
                return saveName;
            }
            else{
                return saveName;
            }
        }
        else{
            console.log('ruleList.length <= 0');
            return(saveName);
        }
    }

    getSaveFileName() {
        console.log('getSaveFileName');
    
        return new Promise((resolve, reject) => {
            this.ruleMgr.getEnabledRules()
                .then(ruleList => {
                    var saveName = this.saveName;
    
                    if (ruleList.length > 0) {
                        console.log('ruleList.length > 0');
                        const matchedRules = this.getMatchRule(ruleList);
                        
                        if (matchedRules.length > 0) {
                            saveName = matchedRules[0].savePath + '/' + this.fileName;
                            this.saveName = saveName;
                            resolve(saveName);
                        } else {
                            resolve(saveName);
                        }
                    } else {
                        console.log('ruleList.length <= 0');
                        resolve(saveName);
                    }
                })
                .catch(error => {
                    console.error('Error in getSaveFileName:', error);
                    reject(error);
                });
        });
    }

    //传入的url是否为下载url的子串
    _urlMatched(url){    
        console.log('_urlMatched');    
        console.log(`url:${url}`);
        console.log(`url:${this.url}`); 
        console.log(`url:${this.url.indexOf(url)}`); 
        const result = (this.url.indexOf(url) != -1) || (url == '');
        return result;
    }

    //传入的文件名后缀是否为下载文件的后缀
    _extensionMatched(extension){    
        console.log('_extensionMatched');            
        const fileExt = '.' + this.getFileExtension(this.fileName);
        const result = (extension.indexOf(fileExt) != -1) || (extension == '');
        return result;
    }

    //文件名是否满足规则的正则表达式
    _fileNameMatched(filename){
        const regObj = new RegExp(filename);
        console.log('_fileNameMatched');    
        const result = regObj.test(this.fileName) || (filename == '');
        return result;
    }


}
