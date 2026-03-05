// InPageEdit NEXT
// const IPE_LINK = "https://cdn.jsdelivr.net/npm/@inpageedit/core/dist/index.js"
// document.body.append(
//     Object.assign(document.createElement('script'), {
//         src: IPE_LINK,
//         type: 'module',
//     })
// )
import { Schema } from "https://cdn.jsdelivr.net/npm/@inpageedit/core/dist/index.js";
mw.hook('InPageEdit.ready').add(function (ipe) {
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
                "quickEdit.editSummary": "[IPEN] ",
                "quickMove.reason": "[IPEN:Move] ",
                "quickRedirect.reason": "[IPEN:Redirect] ",
                "quickUpload.summary": "[IPEN:Upload] ",
                "toolboxAlwaysShow": true
            })
        },
    })
    ipe.plugin({
        inject: ['preferences'/* ,'inArticleLinks' */],
        name: "format-edit-summary",
        PreferencesSchema: Schema.object({
            "formatEditSummary.template": Schema.string().description('编辑摘要模板'),
        }),
        PreferencesDefaults: {
            "formatEditSummary.template": '[IPEN] /* ${section} */ ',
        },
        apply: function (ctx) {
            ctx.preferences.defineCategory({
                name: "format-edit-summary",
                index: 15
            })
            ctx.on('in-article-links/anchor-parsed', async (paylo) => {
                /**@type {HTMLAnchorElement} */
                const a = paylo.anchor;
                const sectionName = a.title?.replace(/^.*?：/, '');
                console.log("章节：", sectionName, a);
                setTimeout(() => {
                    const qeb = a.querySelector('+a.ipe-quick-edit');
                    console.log(qeb);

                }, 10);
            })
        },
    })
})