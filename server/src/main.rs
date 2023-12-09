// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use openai_api_rs::v1::api::Client;
use openai_api_rs::v1::chat_completion::{self, ChatCompletionRequest};
use openai_api_rs::v1::common::GPT3_5_TURBO;
use std::env;


#[tauri::command]
fn answer(msg: &str) -> Option<String> {
    let client = Client::new(env::var("OPENAI_API_KEY").unwrap().to_string());
    let req = ChatCompletionRequest::new(
        GPT3_5_TURBO.to_string(),
        vec![chat_completion::ChatCompletionMessage {
            role: chat_completion::MessageRole::user,
            content: String::from(msg),
            name: None,
            function_call: None,
        }],
    );

    match client.chat_completion(req) {
        Ok(result) => {
            if let Some(content) = result.choices.get(0).and_then(|choice| choice.message.content.clone()) {
                Some(content)
            } else {
                // Handle the case where there are no choices or content is None
                Some(String::from("No response from AI"))
            }
        },
        Err(err) => {
            eprintln!("Error: {}", err);
            // Return a default or error message as a String
            Some(String::from("Error processing request"))
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![answer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
