/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2025 Vendicated and Vesktop contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addPatch } from "./shared";

addPatch({
    getRoleGroupStyle({ id, guildId }: { id: string; guildId: string }) {
        try {
            const GuildRoleStore =
                (Vencord?.Webpack?.Common as any)?.GuildRoleStore ||
                Vencord?.Webpack?.findByProps?.("getRole", "getRoles");
            const color = GuildRoleStore?.getRole?.(guildId, id)?.colorString;
            return color ? { color } : undefined;
        } catch {
            return undefined;
        }
    },

    patches: [
        // Gateway Resume URL patch for Fosscord / custom instances
        {
            find: "resume_gateway_url",
            replacement: {
                match: /this\.setResumeUrl\(\i\.resume_gateway_url\)/,
                replace: "this.setResumeUrl(location.protocol === 'file:' ? arguments[0]?.resume_gateway_url : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}`)"
            }
        },

        // Krisp browser models fallback
        {
            find: "https://cdn.discordapp.com/assets/krisp_browser_models/",
            all: true,
            noWarn: true,
            replacement: {
                match: /https:\/\/cdn\.discordapp\.com\/assets\/krisp_browser_models\//g,
                replace: () =>
                    `${location.protocol}//${(window as any).GLOBAL_ENV?.CDN_HOST || location.host}/krisp_browser_models/`
            }
        },

        // Content assets fallback
        {
            find: "https://cdn.discordapp.com/assets/content/",
            all: true,
            noWarn: true,
            replacement: {
                match: /https:\/\/cdn\.discordapp\.com\/assets\/content\//g,
                replace: () =>
                    `${location.protocol}//${(window as any).GLOBAL_ENV?.CDN_HOST || location.host}/content-assets/`
            }
        },

        // Member List Role Header Colors
        {
            find: '["\\xa0\\u2014 ",',
            replacement: [
                {
                    match: /#{intl::CHANNEL_MEMBERS_A11Y_LABEL}.{0,150}?"aria-hidden":!0,/,
                    replace: "$&style:VesktopPatchGlobals.getRoleGroupStyle(arguments[0]),"
                }
            ]
        },

        // Sticker Paste upload count check bypass
        {
            find: "isReplacement:null!=",
            replacement: {
                match: /if\(\i\.\i\.getUploadCount/,
                replace: "return true;$&"
            }
        },

        // WhoReacted only in real channels
        {
            find: "#{intl::WHO_REACTED_HEADER}",
            replacement: {
                match: /if\(!\i\.fetched\)/,
                replace:
                    "if(!$1.fetched && (Vencord?.Webpack?.Common?.ChannelStore?.getChannel(arguments[0]?.channel_id) || true))"
            }
        },

        // Clean up upsells
        {
            find: '"nitro-tab-group"',
            replacement: {
                match: /\i\?(?=\(0,\i\.jsxs\)\("div",\{children:\[\(0,\i\.jsx\)\(\i,\{nitroTabButtonRef:)/,
                replace: "!1?"
            }
        }
    ]
});
