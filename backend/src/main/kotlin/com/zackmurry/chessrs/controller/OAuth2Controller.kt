package com.zackmurry.chessrs.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.servlet.mvc.support.RedirectAttributes
import org.springframework.web.servlet.view.RedirectView

@Controller
@RequestMapping("/api/v1/oauth2")
class OAuth2Controller {

    // When a user isn't signed in, a GET to this path will trigger the OAuth2 authentication.
    // However, when they are signed in, it would give them a 404.
    // This is a workaround to redirect a signed in user to the home page
    @GetMapping("/code/*")
    fun loginWithLichess(attributes: RedirectAttributes): RedirectView {
        return RedirectView("/")
    }

}