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
    function summaryParser(template, payload) {
        return template?.replace(/\$\{(\w+?)\}/g, (_, k) => {
            return payload[k] ?? ""
        }) ?? "[IPEN:edit]"
    }
    ipe.plugin({
        inject: ['preferences'/* ,'inArticleLinks' */],
        name: "format-edit-summary",
        ConfigSchema : Schema.object({
            "formatEditSummary.template": Schema.string().description('编辑摘要模板').default('[IPEN] /* ${section} */ '),
        }),
        apply: async function (ctx) {
            ctx.preferences.defineCategory({
                name: "format-edit-summary",
                label: "FormatEditSummary", autoGenerateForm: true,
                index: 15
            })
            const template = await ctx.preferences.get("formatEditSummary.template");
            ctx.on('in-article-links/anchor-parsed', async (paylo) => {
                /**@type {HTMLAnchorElement} */
                const a = paylo.anchor;
                setTimeout(() => {
                    const sectionName = a.title?.replace(/^.*?：/, '');
                    if (a.dataset.ipeEditMounted) {
                        const qeb = a.nextElementSibling;
                        if (qeb.classList.contains('ipe-quick-edit') && qeb.dataset.section !== void 0) {
                            console.log(qeb);
                            qeb.dataset.editSummary = summaryParser(template, { section: sectionName })
                        }
                    }
                }, 10);
            })
        },
    })
})