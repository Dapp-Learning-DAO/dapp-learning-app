class Validate {
  isEmail(email: string): boolean {
    // Regular expression for general email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Regular expression for Gmail format validation
    const gmailRegex =
      /^([a-zA-Z0-9._%+-]+)@g([m]+)([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;

    // Check if it is a Gmail address
    if (gmailRegex.test(email)) {
      // Check if the Gmail word is spelled correctly
      const gmailWordCorrect = email.toLowerCase().includes("gmail");
      if (!gmailWordCorrect) {
        console.log(`Incorrect spelling of the word 'Gmail'`);
        return false;
      }
    }

    // Test the email against the general email format regex
    return emailRegex.test(email);
  }

  isPassword(password: string): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password);
  }

  isName(name: string): boolean {
    return /^[a-zA-Z\s]+$/.test(name);
  }

  isPhone(phone: string): boolean {
    return /^\d{10}$/.test(phone);
  }

  isGithubId(githubid: string): boolean {
    return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(githubid);
  }

  isValidZKpasswordInput(input: string): boolean {
    // 正则表达式匹配常规英文字母（大小写）、标点符号和汉字。
    // 这里的标点符号包括了英文和中文的常见标点。
    // const regex = /^[\u4E00-\u9FA5a-zA-Z0-9\s,.!?;:\-，。？！；：“”《》、（）【】—-]+$/;
    const regex = /^[a-zA-Z0-9\s,.!?]+$/;
    return regex.test(input);
  }
}

const validate = new Validate();

export default validate;
