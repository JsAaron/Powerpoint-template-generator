import Stack from '../util/stack'
import { visualLayout } from './visual-config/layout'
import { visualProportion } from './visual-config/proportion'
import { initTranslate } from './visual-config/translate-hook/init'

/**
 * 获取页面对象的样式配置对象
 * @param  {[type]} pageIndex [description]
 * @return {[type]}           [description]
 */
const getPageStyle = function(pageIndex) {
    let pageBase = Xut.Presentation.GetPageObj(pageIndex)
    return pageBase && pageBase.getStyle
}

/**
 * 自定义样式页面容器的样式
 * 创建页面的样式，与布局
 * 1 创建页面的初始化的Transform值
 * 是否初始化创建
 * @return {[type]} [description]
 */
export function styleConfig({
    action,
    usefulData
}) {

    _.each(usefulData, function(data, index) {
        //容器可视区尺寸
        _.extend(data, visualLayout(data.dynamicVisualMode, data.direction))

        //容器内部元素的缩放比
        data.dynamicProportion = visualProportion(data)

        //提供快速索引
        usefulData['_' + data.direction] = data.pid
    })

    /**
     * 获取指定页面样式
     * pageName
     * standbyName 备用名，用于翻页获取
     */
    usefulData.getPageStyle = function(pageName, standbyName) {
        let pageStyle = this[this['_' + pageName]]

        //翻页动态创建的时候，只能索取到一页
        //所以这里需要动态获取关联的中间页面对象
        if (!pageStyle && pageName === 'middle') {
            let standbyStyle = this.getPageStyle(standbyName)
            if (standbyName === 'before') {
                return getPageStyle(standbyStyle.pid + 1)
            }
            if (standbyName === 'after') {
                return getPageStyle(standbyStyle.pid - 1)
            }
        }
        return this[this['_' + pageName]]
    }

    _.each(usefulData, function(data, index) {

        //跳过getStyle方法
        if (_.isFunction(data)) {
            return
        }

        //容器的初始translate值
        _.extend(data, initTranslate({
            usefulData,
            createIndex: data.pid,
            currIndex: data.visiblePid,
            direction: data.direction
        }))
    })


    return usefulData
}