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
        name: "quick-prefix",
        apply: function (ctx) {
            ctx.toolbox.addButton({
                id: 'quick-prefix',
                icon: '⬅️',
                tooltip: 'Special:前缀索引',
                group: "group2",
                index: 8,
                onClick: () => {
                    const pageName = window.mw?.config.get('wgPageName')

                    if (pageName) {
                        const div = document.createElement('div');

                        fetch(`/api.php?${new URLSearchParams({
                            action: 'parse',
                            format: 'json',
                            contentmodel: 'wikitext',
                            text: `{{Special:前缀索引/${pageName}}}`
                        })}`).then(e => e.json()).then(t => div.innerHTML = t.parse.text['*'])
                        const md = ctx.modal.createObject({
                            title: "Special:前缀索引/" + pageName,
                            content: div,
                            className: "quick-prefix",
                            sizeClass: 'smallToMedium',
                            center: true
                        }).init();
                        md.show();

                    }
                }
            })
        },
    })
})