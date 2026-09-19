package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        Surface(
          modifier = Modifier
            .fillMaxSize()
            .systemBarsPadding()
            .imePadding(),
          color = Color(0xFFF8FAFC)
        ) {
          DentalClinicWebView()
        }
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun DentalClinicWebView(modifier: Modifier = Modifier) {
  AndroidView(
    modifier = modifier.fillMaxSize(),
    factory = { context ->
      WebView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT,
          ViewGroup.LayoutParams.MATCH_PARENT
        )

        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          databaseEnabled = true
          allowFileAccess = true
          allowContentAccess = true
          allowFileAccessFromFileURLs = true
          allowUniversalAccessFromFileURLs = true
          cacheMode = WebSettings.LOAD_DEFAULT
          loadWithOverviewMode = true
          useWideViewPort = true
          displayZoomControls = false
          builtInZoomControls = false
          mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        webViewClient = object : WebViewClient() {}

        webChromeClient = object : WebChromeClient() {
          override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            android.util.Log.d(
              "AlFaisalWeb",
              "${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}"
            )
            return super.onConsoleMessage(consoleMessage)
          }
        }

        loadUrl("file:///android_asset/web/index.html")
      }
    }
  )
}
