![topolr-builter](https://github.com/topolr/topolr-builter/raw/master/logo.png)
---------------------------
[![Build Status](https://travis-ci.org/topolr/topolr-builter.svg?branch=master)](https://travis-ci.org/topolr/topolr-builter)
[![license](https://img.shields.io/github/license/topolr/topolr-builter.svg?maxAge=2592000)](https://github.com/topolr/topolr-builter/blob/master/LICENSE)

build the projects which develop by the topolr web framework.

## Useage

```
Useage:
    version      builter version
    build <type>
                 build the project in different ways
                 --pub : build project in publish mode
                 --pub-all : build project in publish mode
                 --dev : build project in publish mode
                 --dev-all : build project in develop mode
    develop      code and debug the project
    init         make topolr-builter-config.js file
```
## Install

`> npm install topolr-builter -g`

## Init the config

`> topolr-builter init`

> 该命令执行后会在当前目录（项目目录）创建`topolr-builter-config.js`文件，编辑该文件便可以使用

## 测试开发项目

`> topolr-builter develop`

> 该命令会监听项目文件的变化然后自动重构项目，同时打开socket端口，用于远程inspect

## 构建项目

`> topolr-builter build --pub`

> 构建发布项目，文件使用hash进行版本追踪

## Options

```
/*
 * topolr-builter version 1.0.0
 * built product developed by topolr web framework
 * topolr-builter-config:
 *   basePath      - app base path
 *   bootPacket    - app boot packet
 *   bootFolder    - app top packet folder
 *   develop       - develop mapping,when trigger develop
 *   publish       - develop mapping,when trigger publish
 *   output        - output folder,relative basePath
 *   pageTemp      - boot index page,relative basePath
 *   outMap        - out map file is or not make
 *   devport       - develop mode will open a socket service to connect to chrome extension
 *   ignore        - scan without files
 *       -default:['*.DS_Store','*.*___jb_tmp___']
 *   maker         - custom maker mapping
 *       -like:{makerName:function(content,option,done){
 *                   done(dosomethind(content,option));
 *              }}
 *       -default maker:
 *         'jsmaker','lessparser','sassparser','cssmaker','cssprefixmaker'
 *         'htmlmaker','mdparser','jsonmaker','templatemaker','babelmaker'
 *   makerOption   - custom maker option {makerName:{}}
 *   sequnce       - make sequnce
 *       -default sequnce:
 *          js:['jsmaker']
 *          css:['cssprefixmaker','cssmaker']
 *          less:['lessparser','cssprefixmaker','cssmaker']
 *          scss:['sassparser','cssprefixmaker','cssmaker']
 *          md:['mdparser','htmlmaker']
 *          html:['htmlmaker']
 *          json:['jsonmaker']
 *          template:['templatemaker']
 *          babel:['babelmaker','jsmaker']
 *   outmapSequnce - out map file make sequnce
 *       -default outmapSequnce:
 *          js:{step:['jsmaker'],to:'js'}
 *          css:{step:['cssprefixmaker','cssmaker'],to:'css'}
 *          less:{step:['lessparser','cssprefixmaker','cssmaker'],to:'css'}
 *          scss:{step:['sassparser','cssprefixmaker','cssmaker'],to:'css'}
 *          md:{step:['mdparser','htmlmaker'],to:'html'}
 *          html:{step:['htmlmaker'],to:'html'}
 *          json:{step:['jsonmaker'],to:'json'}
 *          babel:{step:['babelmaker','jsmaker'],to:'json'}
 */
```