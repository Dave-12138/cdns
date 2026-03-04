// InPageEdit NEXT
document.body.append(
    Object.assign(document.createElement('script'), {
        src: 'https://cdn.jsdelivr.net/npm/@inpageedit/core/dist/index.js',
        type: 'module',
    })
)
mw.hook('InPageEdit.ready').add(function (ipe) {
    ipe.plugin({
        inject: ['preferences'],
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
})