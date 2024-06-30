import 'package:flutter/material.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          "Login",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 25),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.all(10),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextField(
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: "Email",
                  ),
                ),
                SizedBox(
                  height: 10,
                ),
                TextField(
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: "Password",
                  ),
                ),
                ElevatedButton(
                  onPressed: () {},
                  child: const Text("Login"),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
