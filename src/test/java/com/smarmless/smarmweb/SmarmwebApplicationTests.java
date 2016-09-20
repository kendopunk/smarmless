package com.smarmless.smarmweb;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.smarmless.smarmweb.SmarmwebApplication;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = SmarmwebApplication.class)
@WebAppConfiguration
public class SmarmwebApplicationTests {

	@Test
	public void contextLoads() {
	}

}
