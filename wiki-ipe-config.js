// InPageEdit NEXT
// const IPE_LINK = "https://cdn.jsdelivr.net/npm/@inpageedit/core/dist/index.js"
// document.body.append(
//     Object.assign(document.createElement('script'), {
//         src: IPE_LINK,
//         type: 'module',
//     })
// )
import { Schema } from "https://cdn.jsdelivr.net/npm/@inpageedit/core/dist/index.js";
// const { Schema } = await import("https://cdn.jsdelivr.net/npm/@inpageedit/core/dist/index.js");

function summaryParser(template, payload) {
    return template?.replace(/\$\{(\w+?)\}/g, (_, k) => {
        return payload[k] ?? ""
    }) ?? "[IPEN:edit]"
}
mw.hook('InPageEdit.ready').add(function (ipe) {
    ipe.plugin({
        inject: ['preferences', 'quickEdit'/* ,'inArticleLinks' */],
        name: "format-edit-summary",
        apply: async function (ctx) {
            ctx.preferences.defineCategory({
                name: "format-edit-summary",
                label: "FormatEditSummary",
                autoGenerateForm: true,
                index: 15
            })
            ctx.preferences.registerCustomConfig(
                'format-edit-summary',
                Schema.object({
                    "formatEditSummary.template": Schema.string().description('编辑摘要模板').default('[IPE-Next] /* ${section} */ '),
                }),
                "format-edit-summary"
            )
            ctx.on('in-article-links/anchor-parsed', async (paylo) => {
                /**@type {HTMLAnchorElement} */
                const a = paylo.anchor;
                const template = await ctx.preferences.get("formatEditSummary.template");
                setTimeout(() => {
                    const sectionName = a.title?.replace(/^.*?：/, '');
                    if (a.dataset.ipeEditMounted) {
                        const qeb = a.nextElementSibling;
                        if (qeb.classList.contains('ipe-quick-edit') && qeb.dataset.section !== void 0) {
                            // console.log(qeb);
                            qeb.dataset.editSummary = summaryParser(template, { section: sectionName })
                            qeb.onclick = function (e) {
                                e.preventDefault();
                                ctx.quickEdit.showModal({ ...this.dataset });
                            }
                        }
                    }
                }, 10);
            })
        },
    })
    ipe.plugin({
        inject: ['preferences'],
        name: "sync-preferences",
        apply: function (ctx) {
            ctx.preferences.setMany({
                "analytics.enabled": true,
                "pluginStore.plugins": [
                    {
                        "registry": "https://registry.ipe.wiki/registry.v1.json",
                        "id": "code-mirror"
                    }
                ],
                "pluginStore.registries": [
                    "https://registry.ipe.wiki/registry.v1.json"
                ],
                "formatEditSummary.template": "[IPEN] /* ${section} */ ",
                "quickEdit.editSummary": "[IPEN] ",
                "quickMove.reason": "[IPEN:Move] ",
                "quickRedirect.reason": "[IPEN:Redirect] ",
                "quickUpload.summary": "[IPEN:Upload] ",
                "toolboxAlwaysShow": true
            })
        },
    })
    ipe.plugin({
        inject: ['toolbox', 'modal'],
        name: "quick-special",
        apply: function (ctx) {
            const pageName = window.mw?.config.get('wgPageName')
            ctx.toolbox.addButton({
                id: 'quick-special',
                icon: '⬅️',
                tooltip: '前缀与嵌入',
                group: "group2",
                index: 8,
                onClick: () => {

                    if (pageName) {
                        const divPrefix = document.createElement('div');
                        const divLink = document.createElement('div');
                        fetch(`/api.php?${new URLSearchParams({
                            action: 'parse',
                            format: 'json',
                            contentmodel: 'wikitext',
                            text: `{{Special:前缀索引/${pageName}}}`
                        })}`).then(e => e.json()).then(t => divPrefix.innerHTML = t.parse.text['*'])
                        fetch(`/api.php?${new URLSearchParams({
                            action: 'parse',
                            format: 'json',
                            contentmodel: 'wikitext',
                            text: `{{Special:链入页面/${pageName}|limit=50|hidelinks=1}}`
                        })}`).then(e => e.json()).then(t => divLink.innerHTML = t.parse.text['*'])
                        const divModalContent = document.createElement('div');
                        divModalContent.appendChild(divPrefix);
                        divModalContent.appendChild(divLink);
                        const md = ctx.modal.createObject({
                            title: "Special&" + pageName,
                            content: divModalContent,
                            className: "quick-special",
                            sizeClass: 'mediumToLarge',
                            center: true
                        }).init();
                        md.show();

                    }
                }
            })
        },
    })
})