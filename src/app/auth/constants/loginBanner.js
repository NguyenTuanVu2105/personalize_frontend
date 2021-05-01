import React from "react"

export const LOGIN_BANNER_CODE = {
    AI_STORE_EXIST: "wr2wk20j",
    AI_STORE_EMAIL_EXIST: "ipuzmhng",
    IA_NOT_OWN_STORE: "w2em8ors",
}

export const LoginBanner = {
    wr2wk20j: {
        description: "APP INSTALL - Store existed",
        content: (email) => {
            return (
                <p>Your recently authenticated store was connected to PrintHolo with
                    this account: <strong> {email}</strong> before. Please
                    login to this account to manage your store's products.</p>
            )
        }
    },
    ipuzmhng: {
        description: "APP INSTALL - Store owner email existed",
        content: (email) => {
            return (
                <p>It seems your recently authenticated store's
                    email <strong>{email}</strong> was used to register a
                    PrintHolo account before. Please login to this account to manage
                    your store's products.</p>
            )
        }
    },
    w2em8ors: {
        description: "IFRAME ACCESS  - User do not own store",
        content: (email) => {
            return (
                <p>This store is belong to PrintHolo account: <strong> {email}</strong>. Please
                    login to this account to manage your products.</p>
            )
        }
    }
}